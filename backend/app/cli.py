"""Command line: python -m app.cli seed <file>

Creates missing tables, then imports the seed file. Safe to run again.
"""
import argparse
import json

import app.main  # noqa: F401 -- importing the app registers every table
from app.db import Base, SessionLocal, engine
from app.blocks.seed.importer import import_seed


def main():
    parser = argparse.ArgumentParser(prog="python -m app.cli")
    commands = parser.add_subparsers(dest="command", required=True)
    seed = commands.add_parser("seed", help="import a seed_playlists.json file")
    seed.add_argument("file")
    args = parser.parse_args()

    Base.metadata.create_all(engine)
    with open(args.file, encoding="utf-8") as f:
        data = json.load(f)
    with SessionLocal() as db:  # "with": the session is closed even if something fails
        counts, warnings = import_seed(db, data)

    print("Seed import done.")
    for what, number in counts.items():
        print(f"  {what}: {number}")
    if not counts:
        print("  nothing new (already imported)")
    for warning in warnings:
        print(f"  warning: {warning}")


if __name__ == "__main__":
    main()
