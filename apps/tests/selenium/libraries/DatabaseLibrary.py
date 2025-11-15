import psycopg2
import json
from robot.api.deco import keyword
from robot.libraries.BuiltIn import BuiltIn

class DatabaseLibrary:
    """Custom Robot Framework library for database operations"""
    
    def __init__(self):
        self.connection = None
        self.cursor = None
    
    @keyword
    def connect_to_database(self, host='localhost', port=5432, database='doganhubstore', 
                           user='postgres', password='postgres'):
        """Connects to PostgreSQL database"""
        try:
            self.connection = psycopg2.connect(
                host=host,
                port=port,
                database=database,
                user=user,
                password=password
            )
            self.cursor = self.connection.cursor()
            BuiltIn().log("Successfully connected to database")
        except Exception as e:
            BuiltIn().log(f"Database connection failed: {str(e)}", "ERROR")
            raise
    
    @keyword
    def disconnect_from_database(self):
        """Disconnects from database"""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
        BuiltIn().log("Disconnected from database")
    
    @keyword
    def execute_sql_query(self, query, parameters=None):
        """Executes SQL query and returns results"""
        if not self.cursor:
            raise RuntimeError("Not connected to database")
        
        try:
            if parameters:
                self.cursor.execute(query, parameters)
            else:
                self.cursor.execute(query)
            
            # For SELECT queries, fetch results
            if query.strip().upper().startswith('SELECT'):
                columns = [desc[0] for desc in self.cursor.description]
                rows = self.cursor.fetchall()
                return [dict(zip(columns, row)) for row in rows]
            else:
                # For INSERT/UPDATE/DELETE, commit changes
                self.connection.commit()
                return self.cursor.rowcount
        except Exception as e:
            self.connection.rollback()
            BuiltIn().log(f"SQL query failed: {str(e)}", "ERROR")
            raise
    
    @keyword
    def insert_test_data(self, table, data):
        """Inserts test data into specified table"""
        if isinstance(data, dict):
            columns = ', '.join(data.keys())
            placeholders = ', '.join(['%s'] * len(data))
            values = list(data.values())
            query = f"INSERT INTO {table} ({columns}) VALUES ({placeholders}) RETURNING id"
        else:
            raise ValueError("Data must be a dictionary")
        
        result = self.execute_sql_query(query, values)
        return result[0]['id'] if result else None
    
    @keyword
    def delete_test_data(self, table, condition, parameters=None):
        """Deletes test data from specified table"""
        query = f"DELETE FROM {table} WHERE {condition}"
        return self.execute_sql_query(query, parameters)
    
    @keyword
    def verify_data_exists(self, table, condition, parameters=None):
        """Verifies that data exists in database"""
        query = f"SELECT COUNT(*) as count FROM {table} WHERE {condition}"
        result = self.execute_sql_query(query, parameters)
        return result[0]['count'] > 0
    
    @keyword
    def get_record_count(self, table, condition=None, parameters=None):
        """Gets count of records in table"""
        if condition:
            query = f"SELECT COUNT(*) as count FROM {table} WHERE {condition}"
        else:
            query = f"SELECT COUNT(*) as count FROM {table}"
        
        result = self.execute_sql_query(query, parameters)
        return result[0]['count']
    
    @keyword
    def cleanup_test_tables(self):
        """Cleans up test data from all tables"""
        cleanup_queries = [
            "DELETE FROM invoices WHERE description LIKE '%test%'",
            "DELETE FROM transactions WHERE description LIKE '%test%'",
            "DELETE FROM deals WHERE title LIKE '%test%'",
            "DELETE FROM leads WHERE name LIKE '%test%'",
            "DELETE FROM users WHERE email LIKE '%test%'"
        ]
        
        for query in cleanup_queries:
            try:
                self.execute_sql_query(query)
                BuiltIn().log(f"Executed cleanup: {query}")
            except Exception as e:
                BuiltIn().log(f"Cleanup query failed: {query} - {str(e)}", "WARN")
    
    @keyword
    def verify_database_schema(self):
        """Verifies database schema exists"""
        required_tables = [
            'users', 'leads', 'deals', 'transactions', 
            'invoices', 'customers', 'products', 'orders'
        ]
        
        for table in required_tables:
            query = """
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = %s
                )
            """
            result = self.execute_sql_query(query, [table])
            if not result[0]['exists']:
                raise AssertionError(f"Required table '{table}' does not exist")
        
        BuiltIn().log("Database schema verification passed")
        return True
    
    @keyword
    def backup_test_data(self, tables):
        """Creates backup of test data"""
        backup_data = {}
        
        for table in tables:
            query = f"SELECT * FROM {table} WHERE created_at >= CURRENT_DATE"
            result = self.execute_sql_query(query)
            backup_data[table] = result
        
        # Save backup to file
        import json
        import datetime
        
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = f"test_backup_{timestamp}.json"
        
        with open(backup_file, 'w') as f:
            json.dump(backup_data, f, indent=2, default=str)
        
        BuiltIn().log(f"Test data backed up to {backup_file}")
        return backup_file
    
    @keyword
    def restore_test_data(self, backup_file):
        """Restores test data from backup"""
        with open(backup_file, 'r') as f:
            backup_data = json.load(f)
        
        for table, records in backup_data.items():
            for record in records:
                # Remove id to avoid conflicts
                if 'id' in record:
                    del record['id']
                self.insert_test_data(table, record)
        
        BuiltIn().log(f"Test data restored from {backup_file}")
    
    @keyword
    def get_latest_record(self, table, order_by='created_at'):
        """Gets the latest record from table"""
        query = f"SELECT * FROM {table} ORDER BY {order_by} DESC LIMIT 1"
        result = self.execute_sql_query(query)
        return result[0] if result else None
    
    @keyword
    def update_record(self, table, set_clause, condition, parameters=None):
        """Updates record in database"""
        query = f"UPDATE {table} SET {set_clause} WHERE {condition}"
        return self.execute_sql_query(query, parameters)
    
    @keyword
    def verify_foreign_key_constraints(self):
        """Verifies foreign key constraints are working"""
        test_queries = [
            # Try to insert invalid foreign key
            ("INSERT INTO deals (lead_id, title) VALUES (99999, 'Test Deal')", False),
            # Try to delete referenced record
            ("DELETE FROM users WHERE id IN (SELECT user_id FROM leads LIMIT 1)", False)
        ]
        
        for query, should_succeed in test_queries:
            try:
                self.execute_sql_query(query)
                if not should_succeed:
                    raise AssertionError(f"Query should have failed: {query}")
            except Exception as e:
                if should_succeed:
                    raise AssertionError(f"Query should have succeeded: {query} - {str(e)}")
                # Expected failure, rollback transaction
                self.connection.rollback()
        
        BuiltIn().log("Foreign key constraints verification passed")
        return True
    
    @keyword
    def check_data_integrity(self, table):
        """Checks data integrity for specified table"""
        integrity_checks = {
            'users': [
                "SELECT COUNT(*) as count FROM users WHERE email IS NULL OR email = ''",
                "SELECT COUNT(*) as count FROM users WHERE email NOT LIKE '%@%'"
            ],
            'leads': [
                "SELECT COUNT(*) as count FROM leads WHERE name IS NULL OR name = ''",
                "SELECT COUNT(*) as count FROM leads WHERE user_id NOT IN (SELECT id FROM users)"
            ],
            'deals': [
                "SELECT COUNT(*) as count FROM deals WHERE value < 0",
                "SELECT COUNT(*) as count FROM deals WHERE lead_id NOT IN (SELECT id FROM leads)"
            ]
        }
        
        if table not in integrity_checks:
            BuiltIn().log(f"No integrity checks defined for table: {table}", "WARN")
            return True
        
        for check_query in integrity_checks[table]:
            result = self.execute_sql_query(check_query)
            count = result[0]['count']
            if count > 0:
                raise AssertionError(f"Data integrity check failed for {table}: {count} invalid records")
        
        BuiltIn().log(f"Data integrity check passed for table: {table}")
        return True