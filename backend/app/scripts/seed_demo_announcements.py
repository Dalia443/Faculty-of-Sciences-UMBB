"""OPTIONNEL : insère 5 annonces FICTIVES d'exemple (pour voir le site avec du contenu).

    python -m app.scripts.seed_demo_announcements

Ne fait rien si la table des annonces contient déjà des données.
Les annonces insérées sont fictives et portent la mention « (exemple) » dans leur titre.
Vous pouvez les supprimer depuis le tableau de bord.
"""
from datetime import date

from sqlalchemy import func, select

from app.database.connection import SessionLocal
from app.models import Announcement, Category

SAMPLES = [
    ("academic", "2026-11-18", "published", "Calendrier pédagogique (exemple)", "Academic calendar (sample)",
     "Contenu fictif de démonstration. Consultez le calendrier officiel publié par la faculté.",
     "Fictional demonstration content. Please check the official calendar published by the faculty."),
    ("exams", "2026-11-12", "published", "Organisation des examens (exemple)", "Exam organisation (sample)",
     "Annonce fictive pour illustrer la catégorie « Examens ».",
     "Fictional notice illustrating the “Exams” category."),
    ("events", "2026-11-05", "published", "Journée scientifique (exemple)", "Science day (sample)",
     "Événement fictif de démonstration.", "Fictional demonstration event."),
    ("research", "2026-10-28", "published", "Appel à communications (exemple)", "Call for papers (sample)",
     "Annonce fictive illustrant la catégorie « Recherche ».", "Fictional notice illustrating the “Research” category."),
    ("administrative", "2026-10-10", "draft", "Brouillon d'exemple", "Sample draft",
     "Brouillon fictif, visible uniquement dans le tableau de bord.",
     "Fictional draft, only visible in the dashboard."),
]


def main() -> None:
    with SessionLocal() as db:
        if (db.scalar(select(func.count()).select_from(Announcement)) or 0) > 0:
            print("Des annonces existent déjà : rien n'a été ajouté.")
            return
        categories = {c.code: c.id for c in db.scalars(select(Category))}
        for code, day, status, t_fr, t_en, c_fr, c_en in SAMPLES:
            db.add(Announcement(
                title_fr=t_fr, title_en=t_en, content_fr=c_fr, content_en=c_en,
                category_id=categories[code], status=status, published_at=date.fromisoformat(day),
            ))
        db.commit()
        print(f"{len(SAMPLES)} annonces d'exemple ajoutées.")


if __name__ == "__main__":
    main()
