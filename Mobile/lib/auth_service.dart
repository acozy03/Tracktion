import 'dart:convert';
import 'package:http/http.dart' as http;

class AuthService {
    final String baseUrl = 'https://habittracktion.xyz/api'; 

  // Login function
  Future<bool> login(String login, String password) async {
    final url = Uri.parse('$baseUrl/login');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'login': login, 'password': password}),
    );

    if (response.statusCode == 200) {
      return true;
    } else {
      return false;
    }
  }

  // Register function
  Future<bool> register(String firstName, String lastName, String login, String password) async {
  final url = Uri.parse('$baseUrl/register');
  print('Attempting to register with:');
  print('URL: $url');
  print('Payload: ${jsonEncode({
    'firstName': firstName,
    'lastName': lastName,
    'login': login,
    'password': password,
  })}');

  try {
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'firstName': firstName,
        'lastName': lastName,
        'login': login,
        'password': password,
      }),
    );

    // Log response details for debugging
    print('Response status: ${response.statusCode}');
    print('Response body: ${response.body}');

    if (response.statusCode == 201) {
      return true;
    } else {
      // Additional error logging for non-201 responses
      print('Failed to register: ${response.statusCode} - ${response.body}');
      return false;
    }
  } catch (e) {
    print('Error during registration: $e');
    return false;
  }
}


}
