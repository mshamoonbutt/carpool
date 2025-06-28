import os
import argparse
from alembic.config import Config
from alembic import command

def run_migrations():
    parser = argparse.ArgumentParser(description="Run database migrations")
    parser.add_argument("--down", action="store_true", help="Downgrade database")
    parser.add_argument("--revision", help="Create a new migration")
    args = parser.parse_args()
    
    # Get the directory of the current script
    dir_path = os.path.dirname(os.path.realpath(__file__))
    
    # Set up Alembic configuration
    alembic_cfg = Config(os.path.join(dir_path, "migrations", "alembic.ini"))
    alembic_cfg.set_main_option("script_location", os.path.join(dir_path, "migrations"))
    
    if args.revision:
        # Create a new migration
        command.revision(alembic_cfg, args.revision, autogenerate=True)
    elif args.down:
        # Downgrade database
        command.downgrade(alembic_cfg, "-1")
    else:
        # Upgrade database to the latest revision
        command.upgrade(alembic_cfg, "head")

if __name__ == "__main__":
    run_migrations()
