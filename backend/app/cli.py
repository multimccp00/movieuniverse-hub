"""Command line: python -m app.cli seed <file> [--if-empty]

Creates missing tables, then imports the seed file (restoring the example data).
--if-empty: only import into a brand-new database. docker-compose uses it on every
start, so the first start gets the example data and later restarts keep the
changes made in the app.
"""
import argparse
import json

from sqlalchemy import select

import app.main  # noqa: F401 -- importing the app registers every table
from app.db import Base, SessionLocal, engine
from app.blocks.seed.importer import import_seed
from app.blocks.users.models import User


def main():
    parser = argparse.ArgumentParser(prog="python -m app.cli")
    commands = parser.add_subparsers(dest="command", required=True)
    seed = commands.add_parser("seed", help="import a seed_playlists.json file")
    seed.add_argument("file")
    seed.add_argument("--if-empty", action="store_true", help="skip if the database already has users")
    args = parser.parse_args()

    Base.metadata.create_all(engine)
    with SessionLocal() as db:  # "with": the session is closed even if something fails
        if args.if_empty and db.scalar(select(User.id).limit(1)) is not None:
            print("Seed import skipped: the database already has data.")
            return
        with open(args.file, encoding="utf-8") as f:
            warnings = import_seed(db, json.load(f))

    print("Seed import done: example data matches the file.")
    for warning in warnings:
        print(f"  warning: {warning}")


if __name__ == "__main__":
    main()
