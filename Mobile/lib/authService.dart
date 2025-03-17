import 'dart:convert';
import 'package:http/http.dart' as http;

class AuthService {
  final String baseUrl = 'https://habittracktion.xyz/api';

  // Login function
  Future<Map<String, dynamic>> login(String login, String password) async {
    final url = Uri.parse('$baseUrl/login');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'login': login, 'password': password}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else if (response.statusCode == 401) {
      return {'error': 'Incorrect password'};
    } else if (response.statusCode == 404) {
      return {'error': 'User not found'};
    } else if (response.statusCode == 403) {
      final responseBody = jsonDecode(response.body);
      if (responseBody['needsVerification'] ?? false) {
        // Treat it as a successful login but inform about verification
        return {
          'id': responseBody['id'],
          'firstName': responseBody['firstName'],
          'lastName': responseBody['lastName'],
          'message': 'Email not verified'
        };
      }
      return {'error': 'Email not verified'};
    } else {
      return {'error': 'An error occurred'};
    }
  }

  Future<Map<String, dynamic>> fetchUserDetails(
      {String? email, String? username}) async {
    if (email == null && username == null) {
      return {'error': 'Email or username must be provided'};
    }

    final queryParameters =
        email != null ? {'email': email} : {'username': username};

    final url = Uri.parse(
        '$baseUrl/user-details'); // Replace $baseUrl with your API base URL
    final response = await http.get(
      url.replace(queryParameters: queryParameters),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final responseBody = jsonDecode(response.body);
      if (responseBody['success'] == true) {
        return {
          'firstName': responseBody['data']['firstName'],
          'lastName': responseBody['data']['lastName'],
          'userID': responseBody['data']['userID'],
        };
      } else {
        print('test1');
        return {'error': responseBody['error']};
      }
    } else if (response.statusCode == 404) {
      print('test2');
      return {'error': 'User not found'};
    } else {
      print('test3');
      return {'error': 'An error occurred'};
    }
  }

  // register function
  Future<bool> register(String username, String email, String firstName,
      String lastName, String password) async {
    final url = Uri.parse('$baseUrl/registerMobile');

    // Prepare the payload to send in the request body
    final payload = {
      'Username': username,
      'Email': email,
      'FirstName': firstName,
      'LastName': lastName,
      'Password': password,
    };

    print('Attempting to register with:');
    print('URL: $url');
    print('Payload: ${jsonEncode(payload)}');

    print("Before API Try");
    try {
      // Send the POST request
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
        );


       final responseData = jsonDecode(response.body);
      // Check the response status
      if (response.statusCode == 201) {
        // Check if the user needs to verify their email
        if (responseData['needsVerification'] == true) {
          print('Registration successful. A verification email has been sent.');
          return true; // Registration successful
        }
      } else if (response.statusCode == 409) {
        print('User exists but is not verified.');
        return false; // User exists but not verified
      } else if (response.statusCode == 400) {
        print('Username or email already taken.');
        return false; // Username or email already taken
      } else {
        print('Failed to register: ${response.body}');
        return false; // Other error
      }
    } catch (e) {
      print('Error during registration: $e');
      return false; // Error during request
    }

    print("After Try");

    return false; // Default return false if no conditions are met
  }

// Add habit function
  Future<bool> addHabit(Map<String, dynamic> habit) async {
    final url = Uri.parse('$baseUrl/habits');

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(habit),
    );
    print('POST URL: $url');
    print('POST Body: ${jsonEncode(habit)}');

    return response.statusCode == 201;
  }

  // Fetch habits function
  Future<List<Map<String, dynamic>>> fetchHabits(int userId) async {
    final url = Uri.parse('$baseUrl/habits?userId=$userId');
    final response = await http.get(
      url,
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final List habits = jsonDecode(response.body);
      return habits.cast<Map<String, dynamic>>();
    } else {
      throw Exception('Failed to fetch habits for user $userId');
    }
  }

  // Update a habit function
  Future<bool> editHabit(String habitId, Map<String, dynamic> updates) async {
    final url = Uri.parse('$baseUrl/habits/$habitId');
    final response = await http.put(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(updates),
    );

    return response.statusCode == 200;
  }

  // Delete a habit function
  Future<bool> deleteHabit(int habitId) async {
    final url = Uri.parse('$baseUrl/habits/$habitId');
    final response = await http.delete(
      url,
      headers: {'Content-Type': 'application/json'},
    );

    return response.statusCode == 200;
  }

  // Method to fetch user ID
  Future<int> getUserId() async {
    try {
      // Make a request to your backend to fetch the last user
      final response = await http.get(Uri.parse('$baseUrl/login'));

      if (response.statusCode == 200) {
        // If the server returns a successful response (200), parse the user list
        final List<dynamic> lastUser = json.decode(response.body);

        // Calculate the new userID based on the last user's ID
        return lastUser.isNotEmpty ? lastUser[0]['UserID'] + 1 : 1;
      } else {
        // Handle error if response status code is not 200
        throw Exception('Failed to load last user');
      }
    } catch (e) {
      // Handle any errors that might occur during the API request
      print('Error fetching user ID: $e');
      throw Exception('Error fetching user ID');
    }
  }
}
