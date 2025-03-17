import 'package:flutter/material.dart';
import '../authService.dart';
import 'habits.dart';
import 'package:tracktion_mobile/screens/home.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class Login extends StatefulWidget {
  const Login({super.key});

  @override
  State<Login> createState() => _LoginPageState();
}

class _LoginPageState extends State<Login> {
  final AuthService _authService = AuthService();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  Future<void> _handleForgotPassword(String email) async {
    final url = Uri.parse(
        'https://habittracktion.xyz/api/forgot-password'); // backend endpoint

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': email}),
      );

      final responseData = json.decode(response.body);

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(responseData['message'])),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(responseData['error'])),
        );
      }
    } catch (error) {
      print('Error occurred: $error');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('An error occurred, please try again later.')),
      );
    }
  }

  Future<Map<String, dynamic>?> getUserDetails(
      {String? email, String? username}) async {
    if (email == null && username == null) {
      return null; // Or return an appropriate error map
    }

    Map<String, dynamic>? user =
        await _authService.fetchUserDetails(email: email, username: username);

    if (user != null && !user.containsKey('error')) {
      final String firstName = user['firstName'];
      final String lastName = user['lastName'];
      final int userID = user['userID'];

      return {
        'firstName': firstName,
        'lastName': lastName,
        'userID': userID,
      };
    } else {
      return null; // Return null for failure or an appropriate error map
    }
  }

  Future<void> _handleLogin() async {
    final emailOrUsername = _emailController.text.trim();
    final password = _passwordController.text.trim();

    final result = await _authService.login(emailOrUsername, password);

    print('Login API result: $result');
    if (result.containsKey('error') && result['error'].isNotEmpty) {
      String errorMessage = result['error'];

      if (errorMessage == 'Incorrect password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (errorMessage == 'User not found') {
        errorMessage = 'No account found with this username/email.';
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(errorMessage)),
      );
      return;
    }

    Map<String, dynamic>? userInfo = await getUserDetails(
      email: emailOrUsername.contains('@') ? emailOrUsername : null,
      username: !emailOrUsername.contains('@') ? emailOrUsername : null,
    );

    if (userInfo == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to fetch user details.')),
      );
      return;
    }

    _navigateToHome(userInfo);
  }

  void _navigateToHome(Map<String, dynamic> user) {
    final userId = user['userID'];
    final firstName = user['firstName'];
    final lastName = user['lastName'];

    print('User ID: $userId, Name: $firstName $lastName');

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => Home(userId: userId),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      resizeToAvoidBottomInset: true,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: SvgPicture.asset('assets/images/Logo.svg', height: 40),
        automaticallyImplyLeading: false,
      ),
      body: Stack(
        children: [
          Positioned(
            top: 70,
            left: 0,
            right: 10,
            child: Container(
              width: 250,
              height: 600,
              child: Image.asset(
                'assets/images/home-screen.png',
                fit: BoxFit.cover,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(30.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(height: 20.0),
                const Align(
                  child: Text(
                    'Welcome!',
                    style: TextStyle(
                      fontSize: 42.0,
                      fontFamily: 'RubikMono',
                      fontWeight: FontWeight.w400,
                      color: Colors.black,
                    ),
                  ),
                ),
                const Spacer(),
                const Align(
                  child: Text(
                    '',
                    style: TextStyle(
                      fontSize: 32.0,
                      fontFamily: 'Roboto',
                      fontWeight: FontWeight.w400,
                      color: Colors.black,
                    ),
                  ),
                ),
                const Align(
                  child: Text(
                    '',
                    style: TextStyle(
                      fontSize: 40.0,
                      fontFamily: 'Roboto',
                      fontWeight: FontWeight.w600,
                      color: Colors.black,
                    ),
                  ),
                ),
                const SizedBox(height: 20.0),
                Padding(
                  padding: const EdgeInsets.only(bottom: 20.0),
                  child: TextFormField(
                    controller: _emailController,
                    textAlign: TextAlign.center,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                      hintText: 'Enter Username or Email',
                      hintStyle: TextStyle(
                        fontFamily: 'Roboto',
                        fontSize: 16.0,
                        fontWeight: FontWeight.w700,
                        color: Colors.black,
                      ),
                      contentPadding: EdgeInsets.symmetric(
                          vertical: 10.0, horizontal: 20.0),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.all(Radius.circular(32.0)),
                      ),
                      fillColor: Colors.white,
                      filled: true,
                    ),
                  ),
                ),
                const SizedBox(height: 5.0),
                Padding(
                  padding: const EdgeInsets.only(bottom: 10.0),
                  child: TextField(
                    controller: _passwordController,
                    textAlign: TextAlign.center,
                    obscureText: true,
                    decoration: const InputDecoration(
                      hintText: 'Enter Password',
                      hintStyle: TextStyle(
                        fontFamily: 'Roboto',
                        fontSize: 16.0,
                        fontWeight: FontWeight.w700,
                        color: Colors.black,
                      ),
                      contentPadding: EdgeInsets.symmetric(
                          vertical: 10.0, horizontal: 20.0),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.all(Radius.circular(32.0)),
                      ),
                      fillColor: Colors.white,
                      filled: true,
                    ),
                  ),
                ),
                const SizedBox(height: 30.0),
                // Sign In Button
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: OutlinedButton(
                    onPressed: _handleLogin,
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(
                          color: Colors.black, width: 2.0), // Black outline
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(30.0),
                      ),
                      backgroundColor: const Color.fromARGB(255, 100, 252, 217),
                      padding: const EdgeInsets.symmetric(
                          vertical: 12.0, horizontal: 65.0),
                    ),
                    child: const Text(
                      'Sign In',
                      style: TextStyle(
                        color: Color.fromARGB(255, 0, 0, 0),
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'Roboto',
                      ),
                    ),
                  ),
                ),

// Register Button
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: OutlinedButton(
                    onPressed: () {
                      Navigator.pushNamed(context, 'register');
                    },
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(
                          color: Colors.black, width: 2.0), // Black outline
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(30.0),
                      ),
                      backgroundColor: const Color.fromARGB(255, 100, 252, 217),
                      padding: const EdgeInsets.symmetric(
                          vertical: 12.0, horizontal: 60.0),
                    ),
                    child: const Text(
                      'Register',
                      style: TextStyle(
                        color: Color.fromARGB(255, 0, 0, 0),
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'Roboto',
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 8.0),
                TextButton(
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (BuildContext context) {
                        final TextEditingController _forgotPasswordController =
                            TextEditingController();
                        return AlertDialog(
                          title: const Text(
                            'Forgot Password',
                            style: TextStyle(
                                fontFamily: 'Roboto',
                                fontWeight: FontWeight.bold,
                                fontSize: 20),
                          ),
                          content: TextField(
                            controller: _forgotPasswordController,
                            keyboardType: TextInputType.emailAddress,
                            decoration: const InputDecoration(
                              labelText: 'Enter your email address',
                              border: OutlineInputBorder(),
                            ),
                          ),
                          actions: [
                            TextButton(
                              onPressed: () {
                                Navigator.of(context).pop();
                              },
                              child: const Text(
                                'Cancel',
                                style: TextStyle(color: Colors.red),
                              ),
                            ),
                            ElevatedButton(
                              onPressed: () {
                                final email =
                                    _forgotPasswordController.text.trim();
                                _handleForgotPassword(email);
                                if (email.isNotEmpty) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                        content: Text(
                                            'Password reset link sent to $email')),
                                  );
                                  Navigator.of(context).pop();
                                } else {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                        content: Text(
                                            'Please enter a valid email address')),
                                  );
                                }
                              },
                              child: const Text('Send'),
                            ),
                          ],
                        );
                      },
                    );
                  },
                  child: const Text(
                    'Forgot Password?',
                    style: TextStyle(
                      fontSize: 20.0,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                      fontFamily: 'Roboto',
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}