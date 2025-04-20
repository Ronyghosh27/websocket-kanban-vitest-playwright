// import { render, screen, fireEvent } from '@testing-library/react';
// import { vi } from 'vitest';
// import KanbanBoard from '../KanbanBoard.jsx';
// import { DndProvider } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';

// // Mock socket.io-client
// vi.mock('socket.io-client', () => {
//   const mockSocket = {
//     on: vi.fn(),
//     emit: vi.fn(),
//     off: vi.fn(),
//   };
//   return { io: () => mockSocket };
// });

// describe('KanbanBoard', () => {
//   it('renders Kanban board with columns', () => {
//     render(
//       <DndProvider backend={HTML5Backend}>
//         <KanbanBoard />
//       </DndProvider>
//     );
//     expect(screen.getByText('To Do')).toBeInTheDocument();
//     expect(screen.getByText('In Progress')).toBeInTheDocument();
//     expect(screen.getByText('Done')).toBeInTheDocument();
//   });

//   it('opens task creation modal when clicking Add Task button', () => {
//     render(
//       <DndProvider backend={HTML5Backend}>
//         <KanbanBoard />
//       </DndProvider>
//     );
//     const addButton = screen.getByText('Add Task');
//     fireEvent.click(addButton);
//     expect(screen.getByText('Create New Task')).toBeInTheDocument();
//   });

//   it('creates a task when submitting the modal form', () => {
//     render(
//       <DndProvider backend={HTML5Backend}>
//         <KanbanBoard />
//       </DndProvider>
//     );
//     const addButton = screen.getByText('Add Task');
//     fireEvent.click(addButton);
//     const titleInput = screen.getByLabelText('Title');
//     const createButton = screen.getByText('Create Task');
//     fireEvent.change(titleInput, { target: { value: 'Test Task' } });
//     fireEvent.click(createButton);
//     expect(require('socket.io-client').io().emit).toHaveBeenCalledWith(
//       'task:create',
//       expect.objectContaining({ title: 'Test Task' })
//     );
//   });
// });

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { io } from 'socket.io-client';
import KanbanBoard from './KanbanBoard';

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const emit = jest.fn();
  const on = jest.fn();
  const off = jest.fn();
  return {
    io: jest.fn(() => ({
      on,
      emit,
      off,
      disconnect: jest.fn(),
    })),
  };
});

describe('KanbanBoard Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('opens modal and creates a task', async () => {
    render(
      <DndProvider backend={HTML5Backend}>
        <KanbanBoard />
      </DndProvider>
    );

    fireEvent.click(screen.getByText('Add Task'));
    expect(screen.getByText('Create New Task')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Test Task' } });
    fireEvent.change(screen.getByLabelText('Column'), { target: { value: 'To Do' } });
    fireEvent.click(screen.getByText('Create Task'));

    await waitFor(() => expect(screen.getByText('Test Task')).toBeInTheDocument());
  });

  test('updates a task including attachment', async () => {
    // Mock initial tasks and socket sync
    const mockSocket = io();
    mockSocket.on.mockImplementation((event, callback) => {
      if (event === 'sync:tasks') {
        callback([{ id: '1', title: 'Old Task', column: 'To Do', attachment: null }]);
      }
    });

    render(
      <DndProvider backend={HTML5Backend}>
        <KanbanBoard />
      </DndProvider>
    );

    await waitFor(() => expect(screen.getByText('Old Task')).toBeInTheDocument());

    // Simulate file upload (mock File object)
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = screen.getAllByLabelText('Attachment')[0];
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    // Simulate updating task title and attachment
    const taskInput = screen.getByDisplayValue('Old Task');
    fireEvent.change(taskInput, { target: { value: 'Updated Task' } });

    // Mock onUpdate callback (simplified)
    const onUpdate = jest.fn();
    onUpdate.mockImplementation((updatedTask) => {
      mockSocket.emit('task:update', updatedTask);
    });

    // Verify update with attachment
    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({
        id: '1',
        title: 'Updated Task',
        attachment: expect.stringContaining('blob:'),
      }));
      expect(mockSocket.emit).toHaveBeenCalledWith('task:update', expect.objectContaining({
        id: '1',
        title: 'Updated Task',
        attachment: expect.stringContaining('blob:'),
      }));
    });
  });

  test('deletes a task', async () => {
    // Mock initial tasks and socket sync
    const mockSocket = io();
    mockSocket.on.mockImplementation((event, callback) => {
      if (event === 'sync:tasks') {
        callback([{ id: '1', title: 'Delete Me', column: 'To Do' }]);
      }
    });

    render(
      <DndProvider backend={HTML5Backend}>
        <KanbanBoard />
      </DndProvider>
    );

    await waitFor(() => expect(screen.getByText('Delete Me')).toBeInTheDocument());

    fireEvent.click(screen.getAllByText('Delete')[0]);
    expect(mockSocket.emit).toHaveBeenCalledWith('task:delete', '1');
    await waitFor(() => expect(screen.queryByText('Delete Me')).not.toBeInTheDocument());
  });

  test('handles WebSocket connection and disconnection', async () => {
    const mockSocket = io();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    render(
      <DndProvider backend={HTML5Backend}>
        <KanbanBoard />
      </DndProvider>
    );

    expect(mockSocket.on).toHaveBeenCalledWith('sync:tasks', expect.any(Function));
    expect(consoleSpy).toHaveBeenCalledWith('Client connected:', expect.any(String));

    mockSocket.on.mock.calls.find(([event]) => event === 'disconnect')[1]();
    expect(consoleSpy).toHaveBeenCalledWith('Client disconnected:', expect.any(String));

    consoleSpy.mockRestore();
  });
});