print("Starting test...")
try:
    import sqlalchemy
    print(f"SQLAlchemy version: {sqlalchemy.__version__}")
except ImportError as e:
    print(f"Failed to import SQLAlchemy: {e}")

print("Done!")
