import React, { useState, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

interface Mechanic {
  id: number;
  name: string;
}

interface TimeStart {
  hour: number;
  minute: number;
}

interface Appointment {
  id: string;
  mechanicId: number;
  car: string;
  start: TimeStart;
  duration: number;
  color: string;
}

interface AppointmentProps {
  id: string;
  car: string;
  start: TimeStart;
  duration: number;
  color: string;
  onResize: (id: string, newDuration: number) => void;
}

interface MechanicRowProps {
  mechanic: Mechanic;
  appointments: Appointment[];
  onResize: (id: string, newDuration: number) => void;
}

// Funkcja sprawdzająca, czy dwie naprawy nakładają się czasowo
const appointmentsOverlap = (appt1: Appointment, appt2: Appointment): boolean => {
  // Konwertujemy czasy na minuty od początku dnia (7:00)
  const appt1Start = (appt1.start.hour - 7) * 60 + appt1.start.minute;
  const appt1End = appt1Start + appt1.duration;

  const appt2Start = (appt2.start.hour - 7) * 60 + appt2.start.minute;
  const appt2End = appt2Start + appt2.duration;

  // Sprawdzamy, czy zakresy czasowe się nakładają
  return (appt1Start < appt2End && appt1End > appt2Start);
};

// Funkcja znajdująca najbliższy wolny slot czasowy
const findNearestFreeSlot = (
  draggedAppointment: Appointment,
  otherAppointments: Appointment[],
  preferredStartTime: TimeStart
): TimeStart => {
  // Konwertujemy preferowany czas na minuty od początku dnia
  const preferredStartMinutes = (preferredStartTime.hour - 7) * 60 + preferredStartTime.minute;

  // Jeśli nie ma innych napraw, możemy użyć preferowanego czasu
  if (otherAppointments.length === 0) {
    return preferredStartTime;
  }

  // Sortujemy istniejące naprawy według czasu rozpoczęcia
  const sortedAppointments = [...otherAppointments].sort((a, b) => {
    const aStart = (a.start.hour - 7) * 60 + a.start.minute;
    const bStart = (b.start.hour - 7) * 60 + b.start.minute;
    return aStart - bStart;
  });

  // Szukamy pierwszego wolnego slotu
  let availableStart = 0; // Początek dnia (7:00)

  for (const appointment of sortedAppointments) {
    const appointmentStart = (appointment.start.hour - 7) * 60 + appointment.start.minute;
    const appointmentEnd = appointmentStart + appointment.duration;

    // Sprawdzamy, czy mamy wystarczająco miejsca przed tą naprawą
    if (appointmentStart - availableStart >= draggedAppointment.duration) {
      // Znaleźliśmy wolne miejsce
      // Wybieramy slot, który jest bliżej preferowanego czasu
      if (Math.abs(availableStart - preferredStartMinutes) <= Math.abs(appointmentEnd - preferredStartMinutes)) {
        // Wybieramy slot przed bieżącą naprawą
        const hour = Math.floor(availableStart / 60) + 7;
        const minute = availableStart % 60;
        return { hour, minute };
      }
    }

    // Aktualizujemy dostępny początek na koniec bieżącej naprawy
    availableStart = appointmentEnd;
  }

  // Sprawdzamy, czy jest miejsce po ostatniej naprawie
  const dayEndMinutes = 660; // 18:00 - 7:00 = 11 godzin * 60 minut

  if (dayEndMinutes - availableStart >= draggedAppointment.duration) {
    const hour = Math.floor(availableStart / 60) + 7;
    const minute = availableStart % 60;
    return { hour, minute };
  }

  // Jeśli nie znaleźliśmy wolnego miejsca, zwracamy początek dnia
  return { hour: 7, minute: 0 };
};

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 7; hour <= 18; hour++) {
    const displayHour = hour > 12 ? hour - 12 : hour;
    const amPm = hour >= 12 ? 'PM' : 'AM';

    slots.push({
      time: `${displayHour} ${amPm}`,
      hour,
      minute: 0,
      isHour: true
    });

    [15, 30, 45].forEach(minute => {
      slots.push({
        time: '',
        hour,
        minute,
        isHour: false
      });
    });
  }
  return slots;
};

// Calculate position and width for appointments
const calculateAppointmentStyle = (start: TimeStart, duration: number): React.CSSProperties => {
  // Calculate start position as percentage of day (7am-6pm = 11 hours = 660 minutes)
  const dayStart = 7 * 60; // 7am in minutes
  const startInMinutes = (start.hour * 60) + start.minute;
  const startPercentage = ((startInMinutes - dayStart) / (11 * 60)) * 100;

  // Calculate width as percentage of day
  const widthPercentage = (duration / (11 * 60)) * 100;

  return {
    left: `${startPercentage}%`,
    width: `${widthPercentage}%`
  };
};

const Appointment: React.FC<AppointmentProps> = ({ id, car, start, duration, color, onResize }) => {
  const style = calculateAppointmentStyle(start, duration);
  const [isResizing, setIsResizing] = useState(false);
  const [startResizeX, setStartResizeX] = useState<number | null>(null);
  const [initialWidth, setInitialWidth] = useState<number | null>(null);
  const appointmentRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    data: { type: 'appointment', id }
  });

  const transformStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : {};

  // Rozpoczynamy zmianę rozmiaru
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Zapobiegamy propagacji do DnD

    if (appointmentRef.current) {
      setIsResizing(true);
      setStartResizeX(e.clientX);
      setInitialWidth(appointmentRef.current.getBoundingClientRect().width);

      // Dodajemy event listenery do window
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
    }
  };

  // Obsługujemy ruch podczas zmiany rozmiaru
  const handleResizeMove = (e: MouseEvent) => {
    if (isResizing && startResizeX !== null && initialWidth !== null) {
      const deltaX = e.clientX - startResizeX;
      const containerWidth = appointmentRef.current?.parentElement?.getBoundingClientRect().width || 1;

      // Obliczamy jaki procent dnia reprezentuje zmiana w pikselach
      const deltaPercentage = (deltaX / containerWidth) * 100;

      // Obliczamy, ile minut to zmiana
      const deltaMinutes = Math.round((deltaPercentage / 100) * 660);

      // Zaokrąglamy do najbliższych 15 minut
      const roundedDeltaMinutes = Math.round(deltaMinutes / 15) * 15;

      // Obliczamy nową długość (minimalnie 15 minut)
      const newDuration = Math.max(15, duration + roundedDeltaMinutes);

      // Aktualizujemy tylko styl lokalnie podczas przeciągania
      if (appointmentRef.current) {
        const newWidth = initialWidth + deltaX;
        appointmentRef.current.style.width = `${Math.max(30, newWidth)}px`;
      }
    }
  };

  // Kończymy zmianę rozmiaru i zapisujemy zmiany
  const handleResizeEnd = (e: MouseEvent) => {
    if (isResizing && startResizeX !== null && initialWidth !== null && appointmentRef.current) {
      const deltaX = e.clientX - startResizeX;
      const containerWidth = appointmentRef.current.parentElement?.getBoundingClientRect().width || 1;

      // Obliczamy jaki procent dnia reprezentuje zmiana w pikselach
      const deltaPercentage = (deltaX / containerWidth) * 100;

      // Obliczamy, ile minut to zmiana
      const deltaMinutes = Math.round((deltaPercentage / 100) * 660);

      // Zaokrąglamy do najbliższych 15 minut
      const roundedDeltaMinutes = Math.round(deltaMinutes / 15) * 15;

      // Obliczamy nową długość (minimalnie 15 minut)
      const newDuration = Math.max(15, duration + roundedDeltaMinutes);

      // Informujemy rodzica o zmianie rozmiaru
      onResize(id, newDuration);

      // Resetujemy style i stan
      appointmentRef.current.style.width = '';
      setIsResizing(false);
      setStartResizeX(null);
      setInitialWidth(null);

      // Usuwamy event listenery
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    }
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        // @ts-ignore - zapewniamy, że ref.current jest poprawnie ustawione
        appointmentRef.current = node;
      }}
      style={{
        ...style,
        ...transformStyle,
        position: 'absolute',
        backgroundColor: color || '#3b82f6',
        zIndex: isResizing ? 20 : 10,
        cursor: isResizing ? 'ew-resize' : 'move'
      }}
      className="h-full rounded-md border border-gray-300 shadow-sm p-1 text-sm text-white font-medium overflow-hidden flex items-center justify-between"
      {...(isResizing ? {} : attributes)}
      {...(isResizing ? {} : listeners)}
    >
      <span className="truncate">{car}</span>
      <div
        className="w-2 h-full absolute right-0 top-0 cursor-ew-resize hover:bg-white hover:bg-opacity-20"
        onMouseDown={handleResizeStart}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

const MechanicRow: React.FC<MechanicRowProps> = ({ mechanic, appointments, onResize }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `mechanic-${mechanic.id}`,
    data: { type: 'mechanic', mechanicId: mechanic.id }
  });

  const dropStyle: React.CSSProperties = {
    backgroundColor: isOver ? 'rgba(0, 0, 0, 0.05)' : 'transparent'
  };

  return (
    <div className="relative h-12 border-b border-gray-200 flex items-center">
      <div className="w-24 px-2 font-medium text-gray-700 border-r border-gray-300 h-full flex items-center">
        {mechanic.name}
      </div>
      <div
        ref={setNodeRef}
        className="flex-1 relative h-full"
        style={dropStyle}
        data-mechanic-id={mechanic.id}
      >
        {appointments.map((appointment) => (
          <Appointment
            key={appointment.id}
            id={appointment.id}
            car={appointment.car}
            start={appointment.start}
            duration={appointment.duration}
            color={appointment.color}
            onResize={onResize}
          />
        ))}
      </div>
    </div>
  );
};

const MechanicScheduler: React.FC = () => {
  const timeSlots = generateTimeSlots();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);

  const [mechanics, setMechanics] = useState<Mechanic[]>([
    { id: 1, name: 'Mechanik A' },
    { id: 2, name: 'Mechanik B' },
    { id: 3, name: 'Mechanik C' },
    { id: 4, name: 'Mechanik D' },
    { id: 5, name: 'Mechanik E' }
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'appt1',
      mechanicId: 1,
      car: 'BMW X5',
      start: { hour: 9, minute: 0 },
      duration: 120, // 2 hours in minutes
      color: '#3b82f6'
    },
    {
      id: 'appt2',
      mechanicId: 2,
      car: 'Opel Vectra',
      start: { hour: 12, minute: 0 },
      duration: 90, // 1.5 hours in minutes
      color: '#8b5cf6'
    },
    {
      id: 'appt3',
      mechanicId: 3,
      car: 'Ford Focus',
      start: { hour: 10, minute: 30 },
      duration: 60, // 1 hour in minutes
      color: '#ef4444'
    }
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    // Zapisujemy aktywne zadanie do późniejszego użycia
    const appointment = appointments.find(a => a.id === active.id);
    if (appointment) {
      setActiveAppointment(appointment);
      console.log('Started dragging appointment:', appointment);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;

    console.log('Drag end event:', event);
    console.log('Active:', active);
    console.log('Over:', over);
    console.log('Delta:', delta);

    // Zawsze resetujemy stany na koniec
    setActiveId(null);
    setActiveAppointment(null);

    // Jeśli nie ma over, przerywamy
    if (!over) {
      console.log('No over element, returning');
      return;
    }

    // Pobieramy przeciągane zadanie
    const draggedId = active.id;
    const draggedAppointment = appointments.find(a => a.id === draggedId);
    if (!draggedAppointment) {
      console.log('Could not find appointment with id:', draggedId);
      return;
    }

    // Pobieramy dane o miejscu upuszczenia
    const overId = over.id as string;
    console.log('Over ID:', overId);

    // Sprawdzamy, czy upuszczono na obszarze mechanika
    if (overId.startsWith('mechanic-')) {
      const mechanicId = parseInt(overId.split('-')[1], 10);
      console.log('Mechanic ID:', mechanicId);

      // Pobieramy obiekt rect strefy upuszczania
      if (!over.rect) {
        console.log('No rect available');
        return;
      }

      const rect = over.rect;
      console.log('Rect:', rect);

      // Obliczamy liczbę pikseli na minutę na podstawie szerokości kontenera
      const pixelsPerMinute = rect.width / 660; // 11 godzin * 60 minut
      console.log('Pixels per minute:', pixelsPerMinute);

      // Konwertujemy przesunięcie (delta.x) na minuty
      const deltaMinutes = Math.round(delta.x / pixelsPerMinute);
      console.log('Delta minutes:', deltaMinutes);

      // Pobieramy oryginalny czas i dodajemy przesunięcie
      const originalTimeInMinutes = (draggedAppointment.start.hour - 7) * 60 + draggedAppointment.start.minute;
      const newTimeInMinutes = Math.max(0, Math.min(660, originalTimeInMinutes + deltaMinutes));

      // Zaokrąglamy do najbliższych 15 minut
      const roundedMinutes = Math.round(newTimeInMinutes / 15) * 15;

      // Konwertujemy z powrotem na godziny i minuty
      const hour = Math.floor(roundedMinutes / 60) + 7;
      const minute = roundedMinutes % 60;

      console.log('Original time:', draggedAppointment.start);
      console.log('New calculated time:', { hour, minute });

      // Tworzymy tymczasowy obiekt z nowym czasem i mechanikiem
      const tempAppointment: Appointment = {
        ...draggedAppointment,
        start: { hour, minute },
        mechanicId
      };

      // Pobieramy inne naprawy tego mechanika
      const otherAppointmentsForThisMechanic = appointments.filter(
        a => a.mechanicId === mechanicId && a.id !== draggedId
      );

      // Sprawdzamy, czy nowa pozycja koliduje z innymi naprawami
      const hasCollision = otherAppointmentsForThisMechanic.some(
        otherAppt => appointmentsOverlap(tempAppointment, otherAppt)
      );

      if (hasCollision) {
        console.log('Collision detected, finding nearest free slot');

        // Znajdujemy najbliższy wolny slot
        const freeSlot = findNearestFreeSlot(
          draggedAppointment,
          otherAppointmentsForThisMechanic,
          { hour, minute }
        );

        console.log('Found free slot:', freeSlot);

        // Aktualizujemy naprawę z nowym wolnym slotem
        setAppointments(prev =>
          prev.map(app =>
            app.id === draggedId
              ? {
                  ...app,
                  mechanicId,
                  start: freeSlot
                }
              : app
          )
        );
      } else {
        // Jeśli nie ma kolizji, aktualizujemy naprawę z obliczonym czasem
        setAppointments(prev =>
          prev.map(app =>
            app.id === draggedId
              ? {
                  ...app,
                  mechanicId,
                  start: { hour, minute }
                }
              : app
          )
        );
      }
    } else {
      console.log('Not dropped on a mechanic row');
    }
  };

  // Obsługa zmiany rozmiaru naprawy z zapobieganiem nakładaniu się
  const handleResize = (id: string, newDuration: number) => {
    console.log(`Resizing appointment ${id} to ${newDuration} minutes`);

    // Pobieramy naprawę, której rozmiar jest zmieniany
    const appointment = appointments.find(a => a.id === id);
    if (!appointment) return;

    // Tworzymy tymczasowy obiekt z nowym czasem trwania
    const tempAppointment: Appointment = {
      ...appointment,
      duration: newDuration
    };

    // Pobieramy inne naprawy tego mechanika
    const otherAppointmentsForThisMechanic = appointments.filter(
      a => a.mechanicId === appointment.mechanicId && a.id !== id
    );

    // Sprawdzamy, czy nowy rozmiar koliduje z innymi naprawami
    const hasCollision = otherAppointmentsForThisMechanic.some(
      otherAppt => appointmentsOverlap(tempAppointment, otherAppt)
    );

    if (hasCollision) {
      console.log('Resize would cause collision, limiting duration');

      // Znajdujemy maksymalną możliwą długość bez kolizji
      let maxDuration = newDuration;

      // Sortujemy naprawy po czasie rozpoczęcia
      const sortedAppointments = [...otherAppointmentsForThisMechanic].sort((a, b) => {
        const aStart = (a.start.hour - 7) * 60 + a.start.minute;
        const bStart = (b.start.hour - 7) * 60 + b.start.minute;
        return aStart - bStart;
      });

      // Szukamy pierwszej naprawy, która zaczyna się po naszej
      const appointmentStartMinutes = (appointment.start.hour - 7) * 60 + appointment.start.minute;

      for (const otherAppt of sortedAppointments) {
        const otherStartMinutes = (otherAppt.start.hour - 7) * 60 + otherAppt.start.minute;

        if (otherStartMinutes > appointmentStartMinutes) {
          // Znaleźliśmy naprawę, która zaczyna się po naszej
          // Obliczamy maksymalną dozwoloną długość
          const maxAllowedDuration = otherStartMinutes - appointmentStartMinutes;

          if (maxAllowedDuration < maxDuration) {
            maxDuration = maxAllowedDuration;
          }

          break; // Wystarczy znaleźć pierwszą kolidującą naprawę
        }
      }

      // Zaokrąglamy do najbliższych 15 minut w dół
      const roundedMaxDuration = Math.floor(maxDuration / 15) * 15;

      // Aktualizujemy naprawę z ograniczoną długością (minimum 15 minut)
      setAppointments(prev =>
        prev.map(app =>
          app.id === id
            ? { ...app, duration: Math.max(15, roundedMaxDuration) }
            : app
        )
      );
    } else {
      // Jeśli nie ma kolizji, aktualizujemy naprawę z nową długością
      setAppointments(prev =>
        prev.map(app =>
          app.id === id
            ? { ...app, duration: newDuration }
            : app
        )
      );
    }
  };

  const addNewAppointment = () => {
    // Function to add a new appointment (would be triggered by a form/modal in real app)
    const newId = `appt${appointments.length + 1}`;

    // Znajdujemy mechanika z najmniejszą liczbą napraw
    const mechanicCounts = mechanics.map(mechanic => ({
      mechanicId: mechanic.id,
      count: appointments.filter(a => a.mechanicId === mechanic.id).length
    }));

    const leastBusyMechanic = mechanicCounts.sort((a, b) => a.count - b.count)[0];

    // Znajdujemy pierwszy wolny slot dla tego mechanika
    const mechanicAppointments = appointments.filter(a => a.mechanicId === leastBusyMechanic.mechanicId);

    // Sortujemy istniejące naprawy mechanika według czasu rozpoczęcia
    const sortedAppointments = [...mechanicAppointments].sort((a, b) => {
      const aStart = (a.start.hour - 7) * 60 + a.start.minute;
      const bStart = (b.start.hour - 7) * 60 + b.start.minute;
      return aStart - bStart;
    });

    // Szukamy pierwszego wolnego slotu
    let availableStartMinutes = 0; // Początek dnia (7:00)
    const newAppointmentDuration = 60; // 1 godzina

    for (const appointment of sortedAppointments) {
      const appointmentStartMinutes = (appointment.start.hour - 7) * 60 + appointment.start.minute;

      // Sprawdzamy, czy mamy wystarczająco miejsca przed tą naprawą
      if (appointmentStartMinutes - availableStartMinutes >= newAppointmentDuration) {
        // Znaleźliśmy wolne miejsce
        break;
      }

      // Aktualizujemy dostępny początek na koniec bieżącej naprawy
      availableStartMinutes = appointmentStartMinutes + appointment.duration;
    }

    // Zaokrąglamy do najbliższych 15 minut
    const roundedStartMinutes = Math.round(availableStartMinutes / 15) * 15;

    // Konwertujemy z powrotem na godziny i minuty
    const hour = Math.floor(roundedStartMinutes / 60) + 7;
    const minute = roundedStartMinutes % 60;

    const newAppointment: Appointment = {
      id: newId,
      mechanicId: leastBusyMechanic.mechanicId,
      car: 'Nowy samochód',
      start: { hour, minute },
      duration: newAppointmentDuration,
      color: '#10b981'
    };

    setAppointments([...appointments, newAppointment]);
  };

  return (
    <div className="w-full max-w-6xl mx-auto overflow-x-auto">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Harmonogram mechaników</h2>
        <button
          onClick={addNewAppointment}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Dodaj naprawę
        </button>
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-300">
          <div className="w-24 border-r border-gray-300"></div>
          <div className="flex-1 relative">
            <div className="flex">
              {timeSlots.filter(slot => slot.isHour).map((slot, index) => (
                <div key={index} className="flex-1 text-center font-medium text-gray-700 py-2 border-r border-gray-300">
                  {slot.time}
                </div>
              ))}
            </div>

            <div className="flex absolute bottom-0 left-0 right-0">
              {timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className={`h-1 ${index % 4 === 0 ? 'bg-gray-400' : 'bg-gray-200'}`}
                  style={{ width: `${100 / timeSlots.length}%` }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToWindowEdges]}
        >
          {mechanics.map(mechanic => (
            <MechanicRow
              key={mechanic.id}
              mechanic={mechanic}
              appointments={appointments.filter(a => a.mechanicId === mechanic.id)}
              onResize={handleResize}
            />
          ))}

          <DragOverlay>
            {activeId && activeAppointment ? (
              <div
                style={{
                  backgroundColor: activeAppointment.color || '#3b82f6',
                  width: calculateAppointmentStyle(activeAppointment.start, activeAppointment.duration).width,
                  height: '100%'
                }}
                className="rounded-md border border-gray-300 shadow-sm p-1 text-sm text-white font-medium overflow-hidden h-10"
              >
                {activeAppointment.car}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default MechanicScheduler;
