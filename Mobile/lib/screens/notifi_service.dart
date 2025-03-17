import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest_all.dart' as tz_data;

class NotificationService {
  final FlutterLocalNotificationsPlugin notificationsPlugin =
      FlutterLocalNotificationsPlugin();

  NotificationService() {
    tz_data.initializeTimeZones();
    _initializeNotifications();
  }

  Future<void> _initializeNotifications() async {
    const androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const initializationSettings =
        InitializationSettings(android: androidSettings);

    await notificationsPlugin.initialize(initializationSettings);
  }

  Future<NotificationDetails> notificationDetails() async {
    const androidChannelSpecifics = AndroidNotificationDetails(
      'habit_channel',
      'Habit Notifications',
      channelDescription: 'Notifications for habits',
      importance: Importance.max,
      priority: Priority.high,
    );

    return const NotificationDetails(
      android: androidChannelSpecifics,
    );
  }

  Future<void> scheduleDailyNotification({
    required int id,
    required String title,
    required String body,
    required DateTime scheduledTime,
  }) async {
    final tz.TZDateTime scheduleTime =
        tz.TZDateTime.from(scheduledTime, tz.local);

    await notificationsPlugin.zonedSchedule(
      id,
      title,
      body,
      scheduleTime,
      await notificationDetails(),
      androidAllowWhileIdle: true,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      matchDateTimeComponents: DateTimeComponents.time, // Trigger daily
    );
  }
}

