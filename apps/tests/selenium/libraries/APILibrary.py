import requests
import json
from robot.api.deco import keyword
from robot.libraries.BuiltIn import BuiltIn

class APILibrary:
    """Custom Robot Framework library for API testing"""
    
    def __init__(self):
        self.base_url = "http://localhost:3003/api"
        self.session = requests.Session()
        self.auth_token = None
    
    @keyword
    def set_api_base_url(self, url):
        """Sets the base URL for API calls"""
        self.base_url = url
    
    @keyword
    def set_auth_token(self, token):
        """Sets authentication token for API calls"""
        self.auth_token = token
        self.session.headers.update({'Authorization': f'Bearer {token}'})
    
    @keyword
    def make_api_request(self, method, endpoint, data=None, params=None, headers=None):
        """Makes an API request and returns response"""
        url = f"{self.base_url}{endpoint}"
        
        request_headers = {'Content-Type': 'application/json'}
        if headers:
            request_headers.update(headers)
        if self.auth_token:
            request_headers['Authorization'] = f'Bearer {self.auth_token}'
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, params=params, headers=request_headers)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, params=params, headers=request_headers)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data, params=params, headers=request_headers)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, params=params, headers=request_headers)
            elif method.upper() == 'PATCH':
                response = self.session.patch(url, json=data, params=params, headers=request_headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            return response
        except Exception as e:
            BuiltIn().log(f"API request failed: {str(e)}", "ERROR")
            raise
    
    @keyword
    def validate_api_response(self, response, expected_status=200, expected_keys=None):
        """Validates API response status and structure"""
        # Check status code
        if response.status_code != expected_status:
            raise AssertionError(f"Expected status {expected_status}, got {response.status_code}")
        
        # Parse JSON response
        try:
            response_data = response.json()
        except json.JSONDecodeError:
            if expected_status == 200:
                raise AssertionError("Response is not valid JSON")
            return response
        
        # Validate expected keys
        if expected_keys:
            for key in expected_keys:
                if key not in response_data:
                    raise AssertionError(f"Expected key '{key}' not found in response")
        
        return response_data
    
    @keyword
    def authenticate_user(self, email, password):
        """Authenticates user and returns token"""
        login_data = {
            "email": email,
            "password": password
        }
        
        response = self.make_api_request('POST', '/auth/login', data=login_data)
        response_data = self.validate_api_response(response, 200, ['token'])
        
        token = response_data['token']
        self.set_auth_token(token)
        
        return token
    
    @keyword
    def create_test_lead(self, lead_data):
        """Creates a test lead via API"""
        response = self.make_api_request('POST', '/sales/leads', data=lead_data)
        response_data = self.validate_api_response(response, 201, ['id'])
        return response_data['id']
    
    @keyword
    def create_test_deal(self, deal_data):
        """Creates a test deal via API"""
        response = self.make_api_request('POST', '/sales/deals', data=deal_data)
        response_data = self.validate_api_response(response, 201, ['id'])
        return response_data['id']
    
    @keyword
    def create_test_user(self, user_data):
        """Creates a test user via API"""
        response = self.make_api_request('POST', '/auth/register', data=user_data)
        response_data = self.validate_api_response(response, 201, ['id'])
        return response_data['id']
    
    @keyword
    def cleanup_test_data(self, resource_type, resource_id):
        """Cleans up test data after test completion"""
        endpoint_map = {
            'lead': f'/sales/leads/{resource_id}',
            'deal': f'/sales/deals/{resource_id}',
            'user': f'/users/{resource_id}',
            'transaction': f'/finance/transactions/{resource_id}',
            'invoice': f'/finance/invoices/{resource_id}'
        }
        
        if resource_type not in endpoint_map:
            BuiltIn().log(f"Unknown resource type: {resource_type}", "WARN")
            return
        
        endpoint = endpoint_map[resource_type]
        try:
            response = self.make_api_request('DELETE', endpoint)
            if response.status_code in [200, 204, 404]:
                BuiltIn().log(f"Successfully cleaned up {resource_type} {resource_id}")
            else:
                BuiltIn().log(f"Failed to cleanup {resource_type} {resource_id}: {response.status_code}", "WARN")
        except Exception as e:
            BuiltIn().log(f"Error during cleanup of {resource_type} {resource_id}: {str(e)}", "WARN")
    
    @keyword
    def get_api_health_status(self):
        """Checks API health status"""
        try:
            response = self.make_api_request('GET', '/health')
            response_data = self.validate_api_response(response, 200, ['status'])
            return response_data['status'] == 'healthy'
        except Exception as e:
            BuiltIn().log(f"API health check failed: {str(e)}", "ERROR")
            return False
    
    @keyword
    def wait_for_api_response(self, method, endpoint, max_retries=10, delay=1):
        """Waits for API to respond successfully"""
        import time
        
        for attempt in range(max_retries):
            try:
                response = self.make_api_request(method, endpoint)
                if response.status_code == 200:
                    return response
            except Exception:
                pass
            
            if attempt < max_retries - 1:
                time.sleep(delay)
        
        raise AssertionError(f"API did not respond after {max_retries} attempts")
    
    @keyword
    def validate_pagination_response(self, response_data):
        """Validates pagination structure in API response"""
        required_keys = ['data', 'pagination']
        for key in required_keys:
            if key not in response_data:
                raise AssertionError(f"Pagination response missing key: {key}")
        
        pagination = response_data['pagination']
        pagination_keys = ['page', 'limit', 'total', 'totalPages']
        for key in pagination_keys:
            if key not in pagination:
                raise AssertionError(f"Pagination object missing key: {key}")
        
        return True
    
    @keyword
    def generate_mock_data(self, data_type, count=1):
        """Generates mock data for testing"""
        from faker import Faker
        fake = Faker()
        
        generators = {
            'user': lambda: {
                'name': fake.name(),
                'email': fake.email(),
                'password': 'TestPassword123!'
            },
            'lead': lambda: {
                'name': fake.company(),
                'contact': fake.name(),
                'email': fake.email(),
                'phone': fake.phone_number(),
                'source': fake.random_element(['Website', 'Email', 'Referral'])
            },
            'deal': lambda: {
                'title': fake.bs().title(),
                'value': fake.random_int(10000, 100000),
                'stage': fake.random_element(['Negotiation', 'Proposal', 'Closing']),
                'probability': fake.random_int(25, 95)
            },
            'transaction': lambda: {
                'amount': fake.random_int(100, 10000),
                'description': fake.sentence(),
                'category': fake.random_element(['Revenue', 'Expense', 'Transfer'])
            }
        }
        
        if data_type not in generators:
            raise ValueError(f"Unknown data type: {data_type}")
        
        if count == 1:
            return generators[data_type]()
        else:
            return [generators[data_type]() for _ in range(count)]