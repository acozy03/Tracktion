// Habit(s) info
class Habit {
  final String id;
  final String name;
  final String measurementType;
  final String measurementUnit;
  final String frequency;
  final int userId;
  final int streak;
  final String lastUpdated;
  final int goal;

  Habit({
    required this.id,
    required this.name,
    required this.measurementType,
    required this.measurementUnit,
    required this.frequency,
    required this.userId,
    required this.streak,
    required this.lastUpdated,
    required this.goal,
  });

  factory Habit.fromJson(Map<String, dynamic> json) {
    return Habit(
      id: json['_id'],
      name: json['name'],
      measurementType: json['measurementType'],
      measurementUnit: json['measurementUnit'],
      frequency: json['frequency'],
      userId: json['UserID'],
      streak: json['streak'],
      lastUpdated: json['lastUpdated'],
      goal: json['goal'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'measurementType': measurementType,
      'measurementUnit': measurementUnit,
      'frequency': frequency,
      'UserID': userId,
      'streak': streak,
      'lastUpdated': lastUpdated,
      'goal': goal,
    };
  }
}