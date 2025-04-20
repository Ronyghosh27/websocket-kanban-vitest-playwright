import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { io } from 'socket.io-client';
import KanbanBoard from './KanbanBoard';

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const emit = jest.fn();
  const on = jest.fn();
  return {
    io: jest.fn(() => ({
      on,
      emit,
      off: jest.fn(),
    })),
  };
});

// Mock react-dnd
jest.mock('react-dnd', () => ({
  useDrag: () => [{ isDragging: false }, jest.fn()],
  useDrop: () => [jest.fn(), jest.fn()],
  DndProvider: ({ children }) => children,
}));

describe('KanbanBoard Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('syncs tasks across two clients', async () => {
    const mockSocket1 = io();
    const mockSocket2 = io();

    // Simulate first client
    render(
      <DndProvider backend={HTML5Backend}>
        <KanbanBoard />
      </DndProvider>
    );
    mockSocket1.on.mockImplementation((event, callback) => {
      if (event === 'sync:tasks') callback([]);
    });

    // Simulate second client
    const { rerender } = render(
      <DndProvider backend={HTML5Backend}>
        <KanbanBoard />
      </DndProvider>
    );
    mockSocket2.on.mockImplementation((event, callback) => {
      if (event === 'sync:tasks') callback([]);
    });

    // Create a task on client 1
    fireEvent.click(screen.getByText('Add Task'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Shared Task' } });
    fireEvent.click(screen.getByText('Create Task'));
    expect(mockSocket1.emit).toHaveBeenCalledWith('task:create', expect.objectContaining({ title: 'Shared Task' }));

    // Mock sync to client 2
    mockSocket2.on.mock.calls.find(([event]) => event === 'sync:tasks')[1]([{ id: '1', title: 'Shared Task', column: 'To Do' }]);
    rerender(
      <DndProvider backend={HTML5Backend}>
        <KanbanBoard />
      </DndProvider>
    );
    await waitFor(() => expect(screen.getByText('Shared Task')).toBeInTheDocument());
  });

  test('handles drag-and-drop with mocked react-dnd', async () => {
    const mockSocket = io();
    const mockDrop = jest.fn();
    jest.spyOn(require('react-dnd'), 'useDrop').mockReturnValue([mockDrop]);

    render(
      <DndProvider backend={HTML5Backend}>
        <KanbanBoard />
      </DndProvider>
    );

    mockSocket.on.mockImplementation((event, callback) => {
      if (event === 'sync:tasks') callback([{ id: '1', title: 'Drag Me', column: 'To Do' }]);
    });

    await waitFor(() => expect(screen.getByText('Drag Me')).toBeInTheDocument());

    // Simulate drag-and-drop
    mockDrop.mock.calls[0][0]({ id: '1' }, { name: 'In Progress' });
    expect(mockSocket.emit).toHaveBeenCalledWith('task:move', { id: '1', column: 'In Progress' });
  });
});