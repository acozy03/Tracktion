import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Search, PenLine, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { addHabit, editHabit, deleteHabit, fetchHabits, completeHabit } from './api/habits'
import { Habit } from './types/habit'
import { useNavigate } from "react-router-dom"
import RaceTrack from './RaceTrack'
import racecar from '../assets/racecar.png'
import logo from '../assets/tracktion.png'

export default function Component() {
  const [date, setDate] = useState<Date>(new Date())
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitName, setHabitName] = useState("")
  const [measurementType, setMeasurementType] = useState("")
  const [measurementUnit, setMeasurementUnit] = useState("")
  const [measurementAmount, setMeasurementAmount] = useState("")
  const [frequency, setFrequency] = useState("")
  const [frequencyType, setFrequencyType] = useState("")
  const [goal, setGoal] = useState("Days")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState("")
  const [firstName, setFirstName] = useState<string>("")
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedFirstName = localStorage.getItem("firstName")
  
    if (storedUserId) {
      setUserId(storedUserId);
      if (storedFirstName) {
        setFirstName(storedFirstName);
      } else {
        console.error("First name not found in localStorage");
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (userId) {
      fetchUserHabits();
    }
  }, [userId]);

  async function fetchUserHabits() {
    try {
      const fetchedHabits = await fetchHabits(userId);
      setHabits(fetchedHabits);
    } catch (error) {
      console.error('Error fetching habits:', error);
      setError('Failed to fetch habits. Please try again later.');
    }
  }

  async function handleCreateOrEditHabit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
  
    const habitData = {
      name: habitName,
      measurementType,
      measurementUnit: `${measurementAmount} ${measurementUnit}`,
      frequency: `${frequency} per ${frequencyType}`,
      UserID: Number(userId),
      streak: editingHabit ? editingHabit.streak : 0,
      lastUpdated: new Date().toISOString(),
      goal: parseInt(goal),
    };
  
    try {
      if (editingHabit) {
        const updatedHabit = await editHabit(editingHabit._id, habitData);
        setHabits((prevHabits) =>
          prevHabits.map((habit) =>
            habit._id === updatedHabit._id ? updatedHabit : habit
          )
        );
      } else {
        const createdHabit = await addHabit(habitData);
        setHabits((prevHabits) => [...prevHabits, createdHabit]);
      }
      resetForm();
    } catch (error) {
      console.error("Error creating/editing habit:", error);
      setError('Failed to save habit. Please try again.');
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  }
  
  async function handleDeleteHabit(id: string) {
    try {
      console.log("Deleting habit with ID:", id);
      await deleteHabit(id)
      setHabits(prevHabits => prevHabits.filter(habit => habit._id !== id))
    } catch (error) {
      console.error("Error deleting habit:", error)
      setError('Failed to delete habit. Please try again.')
    }
  }

  async function handleHabitCompletion(habit: Habit) {
    try {
      const updatedHabit = await completeHabit(habit._id);
      setHabits(prevHabits => prevHabits.map(h => 
        h._id === updatedHabit._id ? updatedHabit : h
      ));
    } catch (error) {
      console.error("Error completing habit:", error);
      setError('Failed to complete habit. Please try again.');
    }
  }

  function handleLogout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("firstName");
    navigate("/");
  }

  function handleEditHabit(habit: Habit) {
    setEditingHabit(habit)
    setHabitName(habit.name)
    setMeasurementType(habit.measurementType)
    const [amount, unit] = habit.measurementUnit.split(' ')
    setMeasurementAmount(amount)
    setMeasurementUnit(unit)
    const [freq, , type] = habit.frequency.split(' ')
    setFrequency(freq)
    setFrequencyType(type)
    setGoal(habit.goal.toString())
    setIsDialogOpen(true)
  }

  function resetForm() {
    setHabitName("")
    setMeasurementType("")
    setMeasurementUnit("")
    setMeasurementAmount("")
    setFrequency("")
    setFrequencyType("")
    setGoal("")
    setEditingHabit(null)
  }

  const measurementOptions: { [key: string]: string[] } = {
    distance: ["Miles", "Kilometers"],
    time: ["Seconds", "Minutes", "Hours"],
    weight: ["Pounds", "Ounces", "Grams"],
    amount: ["Fluid Ounces"],
  }

  const filteredHabits = habits.filter(habit => 
    habit?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    habit?.measurementUnit?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    habit?.frequency?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  

  return (
    <div className="flex h-screen bg-white font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-[#64FCD9] text-black p-6 space-y-8">
        <img
          src={logo}
          alt="Tracktion logo"
          width={300}
          height={40}
          className="mb-8"
        />
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Welcome, {firstName}</h2>
        </div>
        <div className="flex justify-center items-center p-4 mb-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && setDate(newDate)}
          />
        </div>
        <div className="absolute bottom-6 space-y-4">
        <button 
            className="block text-black/80 hover:text-black"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input 
              className="w-48 bg-gray-200 pl-10" 
              placeholder="SEARCH" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-400 hover:bg-teal-500">
                + ADD HABIT
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingHabit ? 'Edit Habit' : 'Create a New Habit'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateOrEditHabit} className="space-y-4">
                <div>
                  <Label htmlFor="habitName">Habit Name</Label>
                  <Input
                    id="habitName"
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="measurementType">Measurement Type</Label>
                  <Select value={measurementType} onValueChange={setMeasurementType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Measurement Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="distance">Distance</SelectItem>
                      <SelectItem value="time">Time</SelectItem>
                      <SelectItem value="weight">Weight</SelectItem>
                      <SelectItem value="amount">Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {measurementType && (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label htmlFor="measurementAmount">Amount</Label>
                      <Input
                        id="measurementAmount"
                        type="number"
                        value={measurementAmount}
                        onChange={(e) => setMeasurementAmount(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="measurementUnit">Unit</Label>
                      <Select value={measurementUnit} onValueChange={setMeasurementUnit}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {measurementOptions[measurementType]?.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Input
                      id="frequency"
                      type="number"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="frequencyType">Per</Label>
                    <Select value={frequencyType} onValueChange={setFrequencyType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="goal">Goal (days)</Label>
                  <Input
                    id="goal"
                    type="number"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : (editingHabit ? "Update Habit" : "Create Habit")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4 mb-8">
          {filteredHabits.map((habit) => (
            <div
              key={habit._id}
              className="rounded-lg bg-white border"
            >
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{habit.name}</h3>
                  <p className="text-sm opacity-70">
                    {habit.measurementUnit}, {habit.frequency}
                  </p>
                  <p className="text-sm text-blue-600">Streak: {habit.streak} days</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleHabitCompletion(habit)}
                  >
                    Complete
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEditHabit(habit)}>
                    <PenLine className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteHabit(habit._id)}>
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setExpandedHabit(expandedHabit === habit._id ? null : habit._id)}
                  >
                    {expandedHabit === habit._id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              {expandedHabit === habit._id && (
                <div className="p-4 border-t">
                  <RaceTrack streak={habit.streak} goal={habit.goal} carImage={racecar} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

