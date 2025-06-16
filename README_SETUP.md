# EventSphere Setup Instructions

## How to Reset and Start the Application

If you're experiencing issues with the database (particularly with "Data too long for column 'photo'" errors), follow these steps:

1. Make sure MySQL is running on your system
2. Close any running instances of the EventSphere application
3. Run the `limpar-e-iniciar.bat` file by double-clicking it

This script will:
- Stop any running Java processes
- Completely reset the database (deleting and recreating it)
- Create all necessary tables with proper column sizes for storing photos
- Start the EventSphere application

## Manual Steps (if needed)

If you need to run the steps manually:

1. Open a command prompt in the project root directory
2. Run: `mysql -u root -p1234 < reset_database.sql`
3. Navigate to the backend directory: `cd backend\EventSphere`
4. Start the application: `mvnw spring-boot:run`

## Important Notes

- The reset script uses LONGTEXT data type for photo fields, which can store up to 4GB of text
- This should resolve any "Data too long" errors when storing photos
- The application is configured to validate the schema rather than create it, since we're creating it manually
