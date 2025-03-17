// import 'package:flutter/material.dart';
// import '../authService.dart';
// import 'package:flutter_svg/flutter_svg.dart';

// class register extends StatefulWidget {
//   const register({super.key});

//   @override
//   State<register> createState() => _registerPageState();
// }

// class _registerPageState extends State<register> {
//   final AuthService _authService = AuthService();
//   final _firstNameController = TextEditingController();
//   final _lastNameController = TextEditingController();
//   final _emailController = TextEditingController(); // Added Email controller
//   final _usernameController = TextEditingController();
//   final _passwordController = TextEditingController();

//   void _register() async {
//     try {
//       // register the user
//       final result = await _authService.register(
//         _usernameController.text,
//         _emailController.text, // Pass email as well
//         _firstNameController.text,
//         _lastNameController.text,
//         _passwordController.text,
//       );

//       if (result) {
//         // If registration is successful
//         ScaffoldMessenger.of(context).showSnackBar(
//           const SnackBar(
//               content:
//                   Text("Registration successful. Please verify your email.")),
//         );
//         // Optionally, navigate to the login page
//         Navigator.pushNamed(context, '/login');
//       } else {
//         // Show appropriate error messages
//         ScaffoldMessenger.of(context).showSnackBar(
//           const SnackBar(
//               content: Text("Registration failed. Please try again.")),
//         );
//       }
//     } catch (e) {
//       // Handle error
//       print("Error: $e");
//       ScaffoldMessenger.of(context).showSnackBar(
//         const SnackBar(content: Text("An error occurred. Please try again.")),
//       );
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: SvgPicture.asset('assets/images/Logo.svg', height: 40),
//         automaticallyImplyLeading: false,
//       ),
//       body: Stack(
//         children: [
//           // Background image with specific position
//           Positioned(
//             top: 70, // Adjust the position as needed
//             left: 0, // Adjust the position as needed
//             right: 0,
//             child: Container(
//               width: 250, // Adjust width as needed
//               height: 600, // Adjust height as needed
//               child: Image.asset(
//                 'assets/images/edit.png',
//                 fit: BoxFit.cover,
//               ),
//             ),
//           ),
//           // Foreground content
//           Padding(
//             padding: const EdgeInsets.all(
//                 30.0), // Added padding around the entire body
//             child: Column(
//               children: [
//                 const SizedBox(height: 30.0), // Space above the register text
//                 const Text(
//                   'register',
//                   style: TextStyle(
//                       fontSize: 38.0,
//                       fontWeight: FontWeight.bold,
//                       color: Colors.black,
//                       fontFamily: 'RubikMono'),
//                 ),
//                 const SizedBox(height: 20.0),
//                 // First Name Text Field
//                 Padding(
//                   padding: const EdgeInsets.only(bottom: 20.0),
//                   child: TextFormField(
//                     controller: _firstNameController,
//                     textAlign: TextAlign.center,
//                     decoration: const InputDecoration(
//                       hintText: 'Enter First Name',
//                       hintStyle: TextStyle(
//                         fontFamily: 'Roboto',
//                         fontSize: 16.0,
//                         fontWeight: FontWeight.w700,
//                         color: Colors.black,
//                       ),
//                       contentPadding: EdgeInsets.symmetric(
//                           vertical: 10.0, horizontal: 20.0),
//                       border: OutlineInputBorder(
//                         borderRadius: BorderRadius.all(Radius.circular(32.0)),
//                       ),
//                     ),
//                   ),
//                 ),
//                 // Last Name Text Field
//                 Padding(
//                   padding: const EdgeInsets.only(bottom: 20.0),
//                   child: TextFormField(
//                     controller: _lastNameController,
//                     textAlign: TextAlign.center,
//                     decoration: const InputDecoration(
//                       hintText: 'Enter Last Name',
//                       hintStyle: TextStyle(
//                         fontFamily: 'Roboto',
//                         fontSize: 16.0,
//                         fontWeight: FontWeight.w700,
//                         color: Colors.black,
//                       ),
//                       contentPadding: EdgeInsets.symmetric(
//                           vertical: 10.0, horizontal: 20.0),
//                       border: OutlineInputBorder(
//                         borderRadius: BorderRadius.all(Radius.circular(32.0)),
//                       ),
//                     ),
//                   ),
//                 ),
//                 // Email Text Field (newly added)
//                 Padding(
//                   padding: const EdgeInsets.only(bottom: 20.0),
//                   child: TextFormField(
//                     controller: _emailController,
//                     textAlign: TextAlign.center,
//                     keyboardType: TextInputType.emailAddress,
//                     decoration: const InputDecoration(
//                       hintText: 'Enter Email',
//                       hintStyle: TextStyle(
//                         fontFamily: 'Roboto',
//                         fontSize: 16.0,
//                         fontWeight: FontWeight.w700,
//                         color: Colors.black,
//                       ),
//                       contentPadding: EdgeInsets.symmetric(
//                           vertical: 10.0, horizontal: 20.0),
//                       border: OutlineInputBorder(
//                         borderRadius: BorderRadius.all(Radius.circular(32.0)),
//                       ),
//                     ),
//                   ),
//                 ),
//                 // Username Text Field
//                 Padding(
//                   padding: const EdgeInsets.only(bottom: 20.0),
//                   child: TextFormField(
//                     controller: _usernameController,
//                     textAlign: TextAlign.center,
//                     keyboardType: TextInputType.emailAddress,
//                     decoration: const InputDecoration(
//                       hintText: 'Enter Username',
//                       hintStyle: TextStyle(
//                         fontFamily: 'Roboto',
//                         fontSize: 16.0,
//                         fontWeight: FontWeight.w700,
//                         color: Colors.black,
//                       ),
//                       contentPadding: EdgeInsets.symmetric(
//                           vertical: 10.0, horizontal: 20.0),
//                       border: OutlineInputBorder(
//                         borderRadius: BorderRadius.all(Radius.circular(32.0)),
//                       ),
//                     ),
//                   ),
//                 ),
//                 // Password Text Field
//                 Padding(
//                   padding: const EdgeInsets.only(bottom: 20.0),
//                   child: TextField(
//                     controller: _passwordController,
//                     textAlign: TextAlign.center,
//                     obscureText: true,
//                     decoration: const InputDecoration(
//                       hintText: 'Enter Password',
//                       hintStyle: TextStyle(
//                         fontFamily: 'Roboto',
//                         fontSize: 16.0,
//                         fontWeight: FontWeight.w700,
//                         color: Colors.black,
//                       ),
//                       contentPadding: EdgeInsets.symmetric(
//                           vertical: 10.0, horizontal: 20.0),
//                       border: OutlineInputBorder(
//                         borderRadius: BorderRadius.all(Radius.circular(32.0)),
//                       ),
//                     ),
//                   ),
//                 ),
//                 // register Button
//                 Padding(
//                   padding: const EdgeInsets.symmetric(vertical: 15.0),
//                   child: Material(
//                     elevation: 5.0,
//                     color: const Color.fromARGB(255, 100, 252, 217),
//                     borderRadius: BorderRadius.circular(30.0),
//                     child: MaterialButton(
//                       onPressed:
//                           _register, // Trigger the register function here
//                       minWidth: 200.0,
//                       height: 42.0,
//                       child: const Text(
//                         'register',
//                         style: TextStyle(
//                           fontFamily: 'Roboto',
//                           fontSize: 20,
//                           color: Colors.white,
//                         ),
//                       ),
//                     ),
//                   ),
//                 ),
//               ],
//             ),
//           ),
//         ],
//       ),
//     );
//   }
// }

import 'package:flutter/material.dart';
import '../authService.dart';
import 'package:flutter_svg/flutter_svg.dart';

class register extends StatefulWidget {
  const register({super.key});

  @override
  State<register> createState() => _registerPageState();
}

class _registerPageState extends State<register> {
  final AuthService _authService = AuthService();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController(); // Added Email controller
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();

  void _register() async {
    try {
      // register the user
      final result = await _authService.register(
        _usernameController.text,
        _emailController.text, // Pass email as well
        _firstNameController.text,
        _lastNameController.text,
        _passwordController.text,
      );

      if (result) {
        // If registration is successful
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content:
                  Text("Registration successful. Please verify your email.")),
        );
        // Optionally, navigate to the login page
        Navigator.pushNamed(context, '/login');
      } else {
        // Show appropriate error messages
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text("Registration failed. Please try again.")),
        );
      }
    } catch (e) {
      // Handle error
      print("Error: $e");
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("An error occurred. Please try again.")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: SvgPicture.asset('assets/images/Logo.svg', height: 40),
        automaticallyImplyLeading: false,
      ),
      body: Stack(
        children: [
          // Background image with specific position
          Positioned(
            bottom: 0, // Adjust the position as needed
            left: 0, // Adjust the position as needed
            right: 0,
            child: Container(
              width: 250, // Adjust width as needed
              height: 600, // Adjust height as needed
              child: Image.asset(
                'assets/images/edit.png',
                fit: BoxFit.cover,
              ),
            ),
          ),
          // Foreground content
          Padding(
            padding: const EdgeInsets.all(
                30.0), // Added padding around the entire body
            child: Column(
              children: [
                const SizedBox(height: 30.0), // Space above the register text
                const Text(
                  'register',
                  style: TextStyle(
                      fontSize: 38.0,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                      fontFamily: 'RubikMono'),
                ),
                const SizedBox(height: 20.0),
                // First Name Text Field
                Padding(
                  padding: const EdgeInsets.only(bottom: 20.0),
                  child: TextFormField(
                    controller: _firstNameController,
                    textAlign: TextAlign.center,
                    decoration: const InputDecoration(
                      hintText: 'Enter First Name',
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
                      filled: true, // Enables background color
                      fillColor:
                          Colors.white, // Sets the background color to white
                    ),
                  ),
                ),

                // Last Name Text Field
                Padding(
                  padding: const EdgeInsets.only(bottom: 20.0),
                  child: TextFormField(
                    controller: _lastNameController,
                    textAlign: TextAlign.center,
                    decoration: const InputDecoration(
                      hintText: 'Enter Last Name',
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
                      filled: true,
                      fillColor: Colors.white,
                    ),
                  ),
                ),

                // Email Text Field (newly added)
                Padding(
                  padding: const EdgeInsets.only(bottom: 20.0),
                  child: TextFormField(
                    controller: _emailController,
                    textAlign: TextAlign.center,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                      hintText: 'Enter Email',
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
                      filled: true,
                      fillColor: Colors.white,
                    ),
                  ),
                ),

                // Username Text Field
                // Username Text Field
                Padding(
                  padding: const EdgeInsets.only(bottom: 20.0),
                  child: TextFormField(
                    controller: _usernameController,
                    textAlign: TextAlign.center,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                      hintText: 'Enter Username',
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
                      filled: true, // Adds white background
                    ),
                  ),
                ),

// Password Text Field
                Padding(
                  padding: const EdgeInsets.only(bottom: 20.0),
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
                      filled: true, // Adds white background
                    ),
                  ),
                ),

                // register Button
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 15.0),
                  child: Material(
                    elevation: 5.0,
                    borderRadius: BorderRadius.circular(30.0),
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        minimumSize: const Size(200.0, 42.0),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30.0),
                        ),
                        backgroundColor:
                            const Color.fromARGB(255, 100, 252, 217),
                        side: const BorderSide(
                            color: Colors.black, width: 2.0), // Black outline
                      ),
                      onPressed:
                          _register, // Trigger the register function here
                      child: const Text(
                        'register',
                        style: TextStyle(
                          fontFamily: 'Roboto',
                          fontSize: 20,
                          color: Color.fromARGB(255, 0, 0, 0),
                        ),
                      ),
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