import { Habit } from '../types/habit'

const API_URL = 'https://tracktion-backend.vercel.app/api/habits'

async function handleResponse(response: Response) {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  } else {
    // If the response is not JSON, read it as text and throw an error
    const text = await response.text();
    throw new Error(`Received non-JSON response: ${text}`);
  }
}


export async function completeHabit(habitId: string): Promise<Habit> {
  const response = await fetch(`https://tracktion-backend.vercel.app/api/habits/${habitId}/complete`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to complete habit');
  }

  return response.json();
}

export async function fetchHabits(UserID: string): Promise<Habit[]> {
  try {
    const response = await fetch(`${API_URL}/fetch?UserID=${UserID}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching habits:', error);
    throw error;
  }
}

export async function addHabit(habitData: Omit<Habit, '_id'>): Promise<Habit> {
  const response = await fetch('https://tracktion-backend.vercel.app/api/habits/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(habitData),
  });

  if (!response.ok) {
    throw new Error('Failed to add habit');
  }

  return response.json();
}

export async function editHabit(id: string, habitData: Partial<Habit>): Promise<Habit> {
  const response = await fetch(`https://tracktion-backend.vercel.app/api/habits/${id}/edit`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(habitData),
  });

  if (!response.ok) {
    throw new Error('Failed to edit habit');
  }

  return response.json();
}

export async function deleteHabit(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/delete${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    await handleResponse(response);
  } catch (error) {
    console.error('Error deleting habit:', error);
    throw error;
  }
}

