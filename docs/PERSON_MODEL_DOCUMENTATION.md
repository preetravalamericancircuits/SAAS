# Person Model Documentation

## Overview

The Person model has been successfully implemented in the ACI SaaS application with the following specifications:

### Model Definition

```python
class Person(Base):
    __tablename__ = "person"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(PersonRole), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
```

### PersonRole Enum

```python
class PersonRole(enum.Enum):
    SUPER_USER = "SuperUser"
    OPERATOR = "Operator"
    USER = "User"
    ITRA = "ITRA"
```

## Database Schema

### Table Structure

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| username | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | Username for login |
| email | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | Email address |
| hashed_password | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| role | person_role ENUM | NOT NULL, INDEX | User role (SuperUser, Operator, User, ITRA) |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP, INDEX | Creation timestamp |
| is_active | BOOLEAN | DEFAULT TRUE | Account status |

### Indexes Created

- `idx_person_username` - For fast username lookups
- `idx_person_email` - For fast email lookups  
- `idx_person_role` - For role-based queries
- `idx_person_created_at` - For timestamp-based queries

## Pre-configured Users

The following 5 users have been created with the specified names:

| Username | Email | Role | Password |
|----------|-------|------|----------|
| preet | preet@aci.local | SuperUser | password123 |
| kanav | kanav@aci.local | Operator | password123 |
| khash | khash@aci.local | User | password123 |
| cathy | cathy@aci.local | ITRA | password123 |
| pratiksha | pratiksha@aci.local | User | password123 |

## API Endpoints

### Person Management Endpoints

#### 1. Create Person
```http
POST /api/persons
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@aci.local",
  "password": "password123",
  "role": "User"
}
```

#### 2. Get All Persons
```http
GET /api/persons?skip=0&limit=100
```

#### 3. Get Person by ID
```http
GET /api/persons/{person_id}
```

#### 4. Update Person
```http
PUT /api/persons/{person_id}
Content-Type: application/json

{
  "username": "updateduser",
  "email": "updated@aci.local",
  "role": "Operator",
  "is_active": true
}
```

#### 5. Delete Person
```http
DELETE /api/persons/{person_id}
```

## Pydantic Schemas

### Request/Response Models

```python
# Create Person
class PersonCreate(PersonBase):
    password: str

# Update Person  
class PersonUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[PersonRole] = None
    is_active: Optional[bool] = None

# Person Response
class PersonResponse(PersonBase):
    id: str
    is_active: bool
    created_at: datetime
```

## Database Migration

### SQL Migration File
- **Location**: `db/migrations/003_create_person_table.sql`
- **Features**: 
  - Creates PostgreSQL ENUM type for roles
  - Creates person table with all specified fields
  - Creates indexes for performance
  - Inserts 5 pre-configured users

### Alembic Integration
- **Configuration**: `backend/alembic.ini`
- **Environment**: `backend/alembic/env.py`
- **Migration Script**: `backend/generate_migration.py`

## Usage Examples

### Creating a New Person
```python
from schemas import PersonCreate, PersonRole

new_person = PersonCreate(
    username="john_doe",
    email="john@aci.local", 
    password="securepassword",
    role=PersonRole.USER
)
```

### Querying Persons by Role
```python
# Get all SuperUsers
super_users = db.query(Person).filter(Person.role == PersonRole.SUPER_USER).all()

# Get active users
active_users = db.query(Person).filter(Person.is_active == True).all()
```

### Updating Person Status
```python
person = db.query(Person).filter(Person.username == "john_doe").first()
person.is_active = False
db.commit()
```

## Security Features

### Password Hashing
- Uses bcrypt with salt for password hashing
- Secure password verification
- Configurable hashing rounds

### Role-Based Access
- Enum-based role validation
- Type-safe role assignments
- Database-level role constraints

### Data Validation
- Pydantic schema validation
- Email format validation
- Unique constraint enforcement

## Performance Considerations

### Indexing Strategy
- Primary key on UUID for fast lookups
- Indexes on frequently queried fields
- Composite indexes for role-based queries

### Query Optimization
- Efficient UUID-based lookups
- Role-based filtering optimization
- Pagination support for large datasets

## Testing

### Unit Tests
```python
def test_create_person():
    person_data = PersonCreate(
        username="testuser",
        email="test@aci.local",
        password="testpass",
        role=PersonRole.USER
    )
    # Test person creation logic
```

### Integration Tests
```python
def test_person_api_endpoints():
    # Test all CRUD operations via API
    # Test validation and error handling
```

## Deployment

### Database Migration
```bash
# Apply migrations
docker-compose exec backend python generate_migration.py

# Or manually
docker-compose exec postgres psql -U aci_user -d aci_db -f /docker-entrypoint-initdb.d/003_create_person_table.sql
```

### Verification
```bash
# Check if table exists
docker-compose exec postgres psql -U aci_user -d aci_db -c "\d person"

# Check if users were created
docker-compose exec postgres psql -U aci_user -d aci_db -c "SELECT username, email, role FROM person;"
```

## Troubleshooting

### Common Issues

1. **UUID Extension Missing**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

2. **Enum Type Already Exists**
   ```sql
   DROP TYPE IF EXISTS person_role CASCADE;
   ```

3. **Duplicate Username/Email**
   - Check for existing users before creation
   - Use ON CONFLICT handling in migrations

### Debug Commands
```bash
# Check database connection
docker-compose exec postgres pg_isready -U aci_user

# View table structure
docker-compose exec postgres psql -U aci_user -d aci_db -c "\d+ person"

# Check migration status
docker-compose exec backend alembic current
```

## Future Enhancements

### Planned Features
1. **Audit Logging** - Track person changes
2. **Soft Deletes** - Mark as deleted instead of hard delete
3. **Bulk Operations** - Import/export person data
4. **Role Hierarchy** - Define role permissions
5. **Password Policies** - Enforce password complexity

### Scalability Considerations
1. **Partitioning** - Partition by role or date
2. **Caching** - Redis cache for frequent queries
3. **Search** - Full-text search on username/email
4. **API Versioning** - Version API endpoints

---

**Implementation Status**: ✅ COMPLETED  
**Database Migration**: ✅ READY  
**API Endpoints**: ✅ IMPLEMENTED  
**Documentation**: ✅ COMPLETE  
**Testing**: 🔄 PENDING 