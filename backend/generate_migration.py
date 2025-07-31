#!/usr/bin/env python3
"""
Script to generate Alembic migration for the Person table
"""

import os
import sys
import subprocess

def generate_migration():
    """Generate Alembic migration for the Person table"""
    
    # Change to the backend directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    try:
        # Generate the migration
        result = subprocess.run([
            'alembic', 'revision', '--autogenerate', '-m', 'Create Person table'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Migration generated successfully!")
            print(result.stdout)
        else:
            print("❌ Error generating migration:")
            print(result.stderr)
            
    except FileNotFoundError:
        print("❌ Alembic not found. Please install it with: pip install alembic")
    except Exception as e:
        print(f"❌ Error: {e}")

def run_migration():
    """Run the generated migration"""
    
    try:
        # Run the migration
        result = subprocess.run([
            'alembic', 'upgrade', 'head'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Migration applied successfully!")
            print(result.stdout)
        else:
            print("❌ Error applying migration:")
            print(result.stderr)
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🚀 Generating Alembic migration for Person table...")
    generate_migration()
    
    print("\n🚀 Applying migration...")
    run_migration() 