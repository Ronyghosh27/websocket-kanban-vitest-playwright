


import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import io from 'socket.io-client';
import Select from 'react-select';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const socket = io('http://localhost:4000');

const TaskCard = ({ task, onUpdate, onDelete }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'task',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority || 'Low');
  const [category, setCategory] = useState(task.category || 'Bug');
  const [attachment, setAttachment] = useState(task.attachment || null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && ['image/png', 'image/jpeg', 'application/pdf'].includes(file.type)) {
      const url = URL.createObjectURL(file);
      setAttachment(url);
      onUpdate({ ...task, attachment: url });
    } else {
      alert('Unsupported file format');
    }
  };

  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
  ];

  const categoryOptions = [
    { value: 'Bug', label: 'Bug' },
    { value: 'Feature', label: 'Feature' },
    { value: 'Enhancement', label: 'Enhancement' },
  ];

  return (
    <div
      ref={drag}
      className={`p-4 mb-2 bg-white rounded shadow ${isDragging ? 'opacity-50' : ''}`}
    >
      <input
        type="text"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          onUpdate({ ...task, title: e.target.value });
        }}
        className="w-full mb-2 p-1 border"
      />
      <textarea
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
          onUpdate({ ...task, description: e.target.value });
        }}
        className="w-full mb-2 p-1 border"
      />
      <Select
        options={priorityOptions}
        value={priorityOptions.find((opt) => opt.value === priority)}
        onChange={(opt) => {
          setPriority(opt.value);
          onUpdate({ ...task, priority: opt.value });
        }}
        className="mb-2"
      />
      <Select
        options={categoryOptions}
        value={categoryOptions.find((opt) => opt.value === category)}
        onChange={(opt) => {
          setCategory(opt.value);
          onUpdate({ ...task, category: opt.value });
        }}
        className="mb-2"
      />
      <input type="file" onChange={handleFileUpload} className="mb-2" />
      {attachment && (
        <div className="mb-2">
          {attachment.includes('pdf') ? (
            <a href={attachment} target="_blank" rel="noopener noreferrer">
              View PDF
            </a>
          ) : (
            <img src={attachment} alt="Attachment" className="w-full h-32 object-cover" />
          )}
        </div>
      )}
      <button
        onClick={() => onDelete(task.id)}
        className="bg-red-500 text-white px-2 py-1 rounded"
      >
        Delete
      </button>
     </div>
  );
};

const Column = ({ title, tasks, onDrop, onUpdate, onDelete }) => {
  const [, drop] = useDrop(() => ({
    accept: 'task',
    drop: (item) => onDrop(item.id, title),
  }));

  return (
    <div ref={drop} className="w-1/3 p-4 bg-gray-100 rounded">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  );
};

const TaskCreationModal = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Low');
  const [category, setCategory] = useState('Bug');
  const [column, setColumn] = useState('To Do');
  const [attachment, setAttachment] = useState(null);

  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
  ];

  const categoryOptions = [
    { value: 'Bug', label: 'Bug' },
    { value: 'Feature', label: 'Feature' },
    { value: 'Enhancement', label: 'Enhancement' },
  ];

  const columnOptions = [
    { value: 'To Do', label: 'To Do' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Done', label: 'Done' },
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && ['image/png', 'image/jpeg', 'application/pdf'].includes(file.type)) {
      const url = URL.createObjectURL(file);
      setAttachment(url);
    } else {
      alert('Unsupported file format');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onCreate({
        id: Date.now().toString(),
        title,
        description,
        priority,
        category,
        column,
        attachment,
      });
      setTitle('');
      setDescription('');
      setPriority('Low');
      setCategory('Bug');
      setColumn('To Do');
      setAttachment(null);
      onClose();
    } else {
      alert('Please enter a title.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 max-w-md">
        <h2 className="text-xl font-bold mb-4">Create New Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
             <label className="block mb-1">Title</label>
             <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Priority</label>
            <Select
              options={priorityOptions}
              value={priorityOptions.find((opt) => opt.value === priority)}
              onChange={(opt) => setPriority(opt.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Category</label>
            <Select
              options={categoryOptions}
              value={categoryOptions.find((opt) => opt.value === category)}
              onChange={(opt) => setCategory(opt.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Column</label>
            <Select
              options={columnOptions}
              value={columnOptions.find((opt) => opt.value === column)}
              onChange={(opt) => setColumn(opt.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Attachment</label>
             <input type="file" onChange={handleFileUpload} className="mb-2" />
             {attachment && (
              <div className="mt-2">
                {attachment.includes('pdf') ? (
                  <a href={attachment} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                    View PDF
                  </a>
                ) : (
                  <img src={attachment} alt="Attachment Preview" className="w-32 h-32 object-cover" />
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
     const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    socket.on('sync:tasks', (updatedTasks) => {
      setTasks(updatedTasks);
      setLoading(false);
    });

    return () => {
      socket.off('sync:tasks');
    };
  }, []);

  const handleCreateTask = (newTask) => {
    socket.emit('task:create', newTask);
setSuccessMessage('Task created successfully!');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const handleUpdateTask = (updatedTask) => {
    socket.emit('task:update', updatedTask);
setSuccessMessage('Task updated successfully!');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const handleDeleteTask = (id) => {
    socket.emit('task:delete', id);
setSuccessMessage('Task deleted successfully!');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const handleDrop = (id, column) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, column } : task
    );
    setTasks(updatedTasks);
    socket.emit('task:move', { id, column });
  };

  // Chart data
  const columns = ['To Do', 'In Progress', 'Done'];
  const taskCounts = columns.map(
    (col) => tasks.filter((task) => task.column === col).length
  );
  const completionPercentage =
    tasks.length > 0
      ? ((tasks.filter((task) => task.column === 'Done').length / tasks.length) * 100).toFixed(2)
      : 0;

  const chartData = {
    labels: columns,
    datasets: [
      {
        label: 'Tasks',
        data: taskCounts,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Kanban Board</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Task
        </button>
        <TaskCreationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateTask}
        />
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="flex space-x-4">
            {columns.map((col) => (
              <Column
                key={col}
                title={col}
                tasks={tasks.filter((task) => task.column === col)}
                onDrop={handleDrop}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Task Progress</h2>
          <Bar data={chartData} options={{ responsive: true }} />
          <p className="mt-2">Completion: {completionPercentage}%</p>
        </div>
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;

