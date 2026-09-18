import { useMemo, useState } from 'react'
import Card from '../components/common/Card'
import MonthGrid from '../components/calendar/MonthGrid'
import SelectedDayPanel from '../components/calendar/SelectedDayPanel'
import WeeklyDistribution from '../components/calendar/WeeklyDistribution'
import NewActivityModal from '../components/calendar/NewActivityModal'
import {
  getMonthMatrix,
  getMonthLabel,
  getWeekDates,
  getWeekRangeLabel,
  buildSubjectsById,
  getTodayKey,
  getCurrentCalendarMonth,
} from '../utils/calendarUtils'
import { useApp } from '../context/AppContext'
import './CalendarPage.css'

export default function CalendarPage() {
  const { t, settings, activities, subjects, addActivity, updateActivity, deleteActivity } = useApp()
  // Mes i dia seleccionats per defecte: sempre el mes/dia real d'avui
  // (mai un mock fix) — veure NOTES.md, "Sincronitzar el dia d'avui amb
  // la data real". `useState(fn)` perquè només cal calcular-ho un cop, en
  // muntar el component.
  const [calendarMonth, setCalendarMonth] = useState(getCurrentCalendarMonth)
  const [selectedDateKey, setSelectedDateKey] = useState(getTodayKey)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)

  const monthCells = useMemo(
    () => getMonthMatrix(calendarMonth.year, calendarMonth.month),
    [calendarMonth],
  )
  const weekDates = useMemo(
    () => getWeekDates(selectedDateKey, settings.weekStartsOn),
    [selectedDateKey, settings.weekStartsOn],
  )
  const subjectsById = useMemo(() => buildSubjectsById(subjects.custom), [subjects.custom])

  const selectedActivities = activities[selectedDateKey] ?? []
  // "XP disponible" és XP encara no guanyat: només compta les activitats
  // pendents (les completades ja han sumat el seu XP al total de l'usuari).
  const selectedXp = selectedActivities.filter((a) => !a.completed).reduce((sum, a) => sum + a.xp, 0)

  function goToPrevMonth() {
    setCalendarMonth(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 },
    )
  }

  function goToNextMonth() {
    setCalendarMonth(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 },
    )
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingActivity(null)
  }

  function handleModalSubmit(payload) {
    if (payload.activityId) {
      updateActivity(payload)
    } else {
      addActivity(payload)
    }
  }

  function handleEditActivity(activity) {
    setEditingActivity(activity)
  }

  function handleDeleteActivity(activity) {
    const confirmed = window.confirm(t('calendar.deleteConfirm', { title: activity.title }))
    if (!confirmed) return
    deleteActivity({ activityId: activity.id, dateKey: selectedDateKey })
  }

  const isModalVisible = isModalOpen || Boolean(editingActivity)

  return (
    <div className="calendar-page">
      <header className="calendar-page-header">
        <h1>{t('calendar.title')}</h1>
        <button
          type="button"
          className="calendar-new-activity-btn"
          onClick={() => setIsModalOpen(true)}
          data-tutorial="tutorial-new-activity-btn"
        >
          <span className="calendar-new-activity-plus">+</span> {t('calendar.newActivity')}
        </button>
      </header>

      <div className="calendar-page-grid">
        <MonthGrid
          monthLabel={getMonthLabel(calendarMonth.year, calendarMonth.month)}
          cells={monthCells}
          activities={activities}
          subjectsById={subjectsById}
          legendSubjects={subjects.userSubjects}
          selectedDateKey={selectedDateKey}
          onSelectDate={setSelectedDateKey}
          onPrevMonth={goToPrevMonth}
          onNextMonth={goToNextMonth}
        />

        <SelectedDayPanel
          dateKey={selectedDateKey}
          dayActivities={selectedActivities}
          totalXp={selectedXp}
          subjectsById={subjectsById}
          onEditActivity={handleEditActivity}
          onDeleteActivity={handleDeleteActivity}
        />
      </div>

      <Card title={t('calendar.weeklyDistribution', { range: getWeekRangeLabel(weekDates) })}>
        <WeeklyDistribution weekDates={weekDates} activities={activities} />
      </Card>

      {isModalVisible && (
        <NewActivityModal
          dateKey={selectedDateKey}
          userSubjects={subjects.userSubjects}
          subjectsById={subjectsById}
          activity={editingActivity}
          onSubmit={handleModalSubmit}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
