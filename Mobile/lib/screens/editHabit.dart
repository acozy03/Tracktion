import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class EditHabitScreen extends StatefulWidget {
  final int userId;
  final Map<String, dynamic> habit;

  const EditHabitScreen({Key? key, required this.userId, required this.habit})
      : super(key: key);

  @override
  State<EditHabitScreen> createState() => _EditHabitScreenState();
}

class _EditHabitScreenState extends State<EditHabitScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _amountController = TextEditingController();
  final TextEditingController _frequencyController = TextEditingController();
  final TextEditingController _frequencyPerController = TextEditingController();
  final TextEditingController _goalController = TextEditingController();
  final TextEditingController _measurementUnitController =
      TextEditingController();
  String? selectedMeasurementType;
  List<String> availableMeasurementUnits = [];

  final Map<String, List<String>> measurementOptions = {
    'distance': ['Miles', 'Kilometers'],
    'time': ['Seconds', 'Minutes', 'Hours'],
    'weight': ['Pounds', 'Ounces', 'Grams'],
    'amount': ['Fluid Ounces'],
  };

  @override
  void initState() {
    super.initState();

    final habit = widget.habit;

// Parse "amount unit" into separate variables
    final amountParts = habit['measurementUnit']?.split(' ') ?? [];
    final double? parsedAmount =
        amountParts.isNotEmpty ? double.tryParse(amountParts[0]) : null;
    final String parsedMeasurementUnit =
        amountParts.length > 1 ? amountParts[1] : '';

// Set amount and measurement unit values
    _amountController.text = parsedAmount?.toString() ?? '';
    _measurementUnitController.text = parsedMeasurementUnit;

// Parse "frequency per time" into separate variables
    final frequencyParts = habit['frequency']?.split(' ') ?? [];
    final int? parsedFrequency =
        frequencyParts.isNotEmpty ? int.tryParse(frequencyParts[0]) : null;
    final String parsedFrequencyPer =
        frequencyParts.length > 1 ? frequencyParts[2] : '';

// Set frequency and frequencyPer values
    _frequencyController.text = parsedFrequency?.toString() ?? '';
    _frequencyPerController.text = parsedFrequencyPer;

// Initialize other variables
    _nameController.text = habit['name'] ?? '';
    _goalController.text = habit['goal']?.toString() ?? '';
    selectedMeasurementType = habit['measurementType'];
    availableMeasurementUnits =
        measurementOptions[selectedMeasurementType] ?? [];
  }

  // Future<void> _saveChanges() async {
  //   if (_formKey.currentState!.validate()) {
  //     final updates = {
  //       'name': _nameController.text,
  //       'amount': _amountController.text,
  //       'frequency': _frequencyController.text,
  //       'frequencyPer': _frequencyPerController.text,
  //       'goal': int.tryParse(_goalController.text) ?? 0,
  //       'measurementType': selectedMeasurementType,
  //       'measurementUnit': _measurementUnitController.text,
  //     };

  //     final habitId = widget.habit['_id'];
  //     final url = Uri.parse('https://habittracktion.xyz/api/habits/$habitId');

  //     try {
  //       final response = await http.put(
  //         url,
  //         headers: {'Content-Type': 'application/json'},
  //         body: jsonEncode(updates),
  //       );

  //       if (response.statusCode == 200) {
  //         ScaffoldMessenger.of(context).showSnackBar(
  //           const SnackBar(content: Text('Habit updated successfully!')),
  //         );
  //         Navigator.pop(context, true);
  //       } else {
  //         ScaffoldMessenger.of(context).showSnackBar(
  //           SnackBar(
  //               content:
  //                   Text('Failed to update habit: ${response.statusCode}')),
  //         );
  //       }
  //     } catch (error) {
  //       print('Error updating habit: $error');
  //       ScaffoldMessenger.of(context).showSnackBar(
  //         const SnackBar(
  //             content: Text('An error occurred while updating the habit.')),
  //       );
  //     }
  //   }
  // }

  Future<void> _saveChanges() async {
    if (_formKey.currentState!.validate()) {
      final updates = {
        'name': _nameController.text,
        'frequency':
            "${_frequencyController.text} per ${_frequencyPerController.text}",
        'goal': int.tryParse(_goalController.text) ?? 0,
        'measurementType': selectedMeasurementType,
        'measurementUnit':
            "${_amountController.text} ${_measurementUnitController.text}",
        'streak': widget.habit['streak'] ?? 0,
      };

      final habitId = widget.habit['_id'];
      final url = Uri.parse('https://habittracktion.xyz/api/habits/$habitId');

      try {
        final response = await http.put(
          url,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(updates),
        );

        if (response.statusCode == 200) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Habit updated successfully!')),
          );
          Navigator.pop(context, true);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
                content:
                    Text('Failed to update habit: ${response.statusCode}')),
          );
        }
      } catch (error) {
        print('Error updating habit: $error');
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('An error occurred while updating the habit.')),
        );
      }
    }
  }

  void _updateMeasurementOptions(String? type) {
    setState(() {
      selectedMeasurementType = type;
      availableMeasurementUnits = measurementOptions[type] ?? [];
      _measurementUnitController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Edit Habit')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: 'Habit Name'),
                validator: (value) => value!.isEmpty ? 'Enter a Name' : null,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: measurementOptions.keys.contains(selectedMeasurementType)
                    ? selectedMeasurementType
                    : null,
                onChanged: _updateMeasurementOptions,
                items: measurementOptions.keys
                    .map((type) => DropdownMenuItem(
                          value: type,
                          child:
                              Text(type[0].toUpperCase() + type.substring(1)),
                        ))
                    .toList(),
                decoration:
                    const InputDecoration(labelText: 'Measurement Type'),
                validator: (value) => value == null ? 'Select a Type' : null,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: availableMeasurementUnits
                        .contains(_measurementUnitController.text)
                    ? _measurementUnitController.text
                    : null,
                onChanged: (value) {
                  setState(() {
                    _measurementUnitController.text = value!;
                  });
                },
                items: availableMeasurementUnits
                    .map((unit) => DropdownMenuItem(
                          value: unit,
                          child: Text(unit),
                        ))
                    .toList(),
                decoration:
                    const InputDecoration(labelText: 'Measurement Unit'),
                validator: (value) => value == null ? 'Select Unit' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _amountController,
                decoration: const InputDecoration(labelText: 'Amount'),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value!.isEmpty) return 'Enter Amount';
                  if (double.tryParse(value) == null)
                    return 'Enter a valid number';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _frequencyController,
                decoration: const InputDecoration(labelText: 'Frequency'),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value!.isEmpty) return 'Enter Frequency';
                  if (int.tryParse(value) == null)
                    return 'Enter a valid number';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _frequencyPerController,
                decoration: const InputDecoration(labelText: 'Per'),
                validator: (value) => value!.isEmpty ? 'Enter Per' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _goalController,
                decoration: const InputDecoration(labelText: 'Goal (days)'),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value!.isEmpty) return 'Enter Goal';
                  if (int.tryParse(value) == null)
                    return 'Enter a valid number';
                  return null;
                },
              ),
              const SizedBox(height: 20),
              const SizedBox(height: 20),
              OutlinedButton(
                onPressed: _saveChanges,
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                  side: const BorderSide(color: Colors.black, width: 2.0),
                  backgroundColor: const Color(0xFF64FCD9),
                ),
                child: const Text(
                  'Save Changes',
                  style: TextStyle(
                    color: Colors.black,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}