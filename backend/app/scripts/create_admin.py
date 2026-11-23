"""Création sécurisée du compte administrateur.

Utilisation (depuis le dossier backend, environnement virtuel activé) :
    python -m app.scripts.create_admin

Le mot de passe est saisi dans le terminal (caché), jamais écrit dans un fichier ni dans le code.
Pour changer le mot de passe d'un compte existant :
    python -m app.scripts.create_admin --reset-password
"""
import argparse
import getpass
import sys

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.database.connection import SessionLocal
from app.models import AdminUser
from pydantic import EmailStr, TypeAdapter

MIN_PASSWORD_LENGTH = 12


def validate_password(password: str) -> str | None:
    """Renvoie un message d'erreur, ou None si le mot de passe est acceptable."""
    if len(password) < MIN_PASSWORD_LENGTH:
        return f"Le mot de passe doit contenir au moins {MIN_PASSWORD_LENGTH} caractères."
    if password.lower() == password or password.upper() == password:
        return "Le mot de passe doit mélanger majuscules et minuscules."
    if not any(c.isdigit() for c in password):
        return "Le mot de passe doit contenir au moins un chiffre."
    return None


def upsert_admin(db: Session, email: str, full_name: str, password: str, reset: bool = False) -> str:
    """Crée (ou met à jour avec reset=True) un compte. Renvoie 'created' ou 'updated'."""
    email = email.strip().lower()
    existing = db.scalar(select(AdminUser).where(AdminUser.email == email))
    if existing and not reset:
        raise ValueError("Un compte avec cet e-mail existe déjà. Utilisez --reset-password pour le modifier.")
    if existing:
        existing.password_hash = hash_password(password)
        existing.is_active = True
        db.commit()
        return "updated"
    db.add(AdminUser(email=email, full_name=full_name.strip(), password_hash=hash_password(password), role="admin"))
    db.commit()
    return "created"


def main() -> int:
    parser = argparse.ArgumentParser(description="Crée le compte administrateur du portail.")
    parser.add_argument("--reset-password", action="store_true", help="Change le mot de passe d'un compte existant")
    args = parser.parse_args()

    email = input("Adresse e-mail de l'administrateur : ").strip()
    try:
        TypeAdapter(EmailStr).validate_python(email)
    except Exception:
        print("Adresse e-mail invalide.")
        return 1
    full_name = "Administrateur"
    if not args.reset_password:
        full_name = input("Nom complet : ").strip() or "Administrateur"

    password = getpass.getpass(f"Mot de passe (min. {MIN_PASSWORD_LENGTH} caractères, caché) : ")
    error = validate_password(password)
    if error:
        print(error)
        return 1
    if password != getpass.getpass("Confirmez le mot de passe : "):
        print("Les deux mots de passe ne correspondent pas.")
        return 1

    with SessionLocal() as db:
        try:
            result = upsert_admin(db, email, full_name, password, reset=args.reset_password)
        except ValueError as exc:
            print(exc)
            return 1
    print("Compte créé avec succès." if result == "created" else "Mot de passe mis à jour.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
