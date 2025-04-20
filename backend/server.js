

// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');
// const { MongoClient } = require('mongodb');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:3000',
//     methods: ['GET', 'POST'],
//   },
// });

// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// const uri = 'mongodb://localhost:27017/kanban'; // Local MongoDB
// // For MongoDB Atlas, use: const uri = 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/kanban?retryWrites=true&w=majority';
// const client = new MongoClient(uri);

// async function connectDB() {
//   try {
//     await client.connect();
//     console.log('Connected to MongoDB');
//     return client.db('kanban').collection('tasks');
//   } catch (error) {
//     console.error('MongoDB connection error:', error);
//     process.exit(1);
//   }
// }

// let tasksCollection;

// connectDB().then((collection) => {
//   tasksCollection = collection;
// });

// io.on('connection', (socket) => {
//   console.log('Client connected:', socket.id);

//   // Sync all tasks to newly connected client
//   (async () => {
//     const tasks = await tasksCollection.find().toArray();
//     socket.emit('sync:tasks', tasks);
//   })();

//   // Handle task creation
//   socket.on('task:create', async (task) => {
//     const newTask = {
//       id: Date.now().toString(),
//       title: task.title || '',
//       description: task.description || '',
//       priority: task.priority || 'Low',
//       category: task.category || 'Bug',
//       column: task.column || 'To Do',
//       attachment: task.attachment || null,
//     };
//     await tasksCollection.insertOne(newTask);
//     const updatedTasks = await tasksCollection.find().toArray();
//     io.emit('sync:tasks', updatedTasks);
//   });

//   // Handle task update
//   socket.on('task:update', async (updatedTask) => {
//     await tasksCollection.updateOne(
//       { id: updatedTask.id },
//       { $set: updatedTask }
//     );
//     const updatedTasks = await tasksCollection.find().toArray();
//     io.emit('sync:tasks', updatedTasks);
//   });

//   // Handle task move
//   socket.on('task:move', async ({ id, column }) => {
//     await tasksCollection.updateOne(
//       { id },
//       { $set: { column } }
//     );
//     const updatedTasks = await tasksCollection.find().toArray();
//     io.emit('sync:tasks', updatedTasks);
//   });

//   // Handle task deletion
//   socket.on('task:delete', async (id) => {
//     await tasksCollection.deleteOne({ id });
//     const updatedTasks = await tasksCollection.find().toArray();
//     io.emit('sync:tasks', updatedTasks);
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected:', socket.id);
//   });
// });

// const PORT = process.env.PORT || 4000;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// // Graceful shutdown
// process.on('SIGTERM', async () => {
//   await client.close();
//   process.exit(0);
// });

// process.on('SIGINT', async () => {
//   await client.close();
//   process.exit(0);
// });


// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');
// const { MongoClient } = require('mongodb');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:3000',
//     methods: ['GET', 'POST'],
//   },
// });

// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// const uri = 'mongodb://localhost:27017/kanban'; // Local MongoDB
// const client = new MongoClient(uri);

// async function connectDB() {
//   try {
//     await client.connect();
//     console.log('Connected to MongoDB');
//     return client.db('kanban').collection('tasks');
//   } catch (error) {
//     console.error('MongoDB connection error:', error);
//     process.exit(1);
//   }
// }

// let tasksCollection;

// connectDB().then((collection) => {
//   tasksCollection = collection;
// });

// io.on('connection', (socket) => {
//   console.log('Client connected:', socket.id);

//   // Sync all tasks to newly connected client
//   (async () => {
//     const tasks = await tasksCollection.find().toArray();
//     socket.emit('sync:tasks', tasks);
//   })();

//   // Handle task creation
//   socket.on('task:create', async (task) => {
//     const newTask = {
//       id: task.id || Date.now().toString(),
//       title: task.title || '',
//       description: task.description || '',
//       priority: task.priority || 'Low',
//       category: task.category || 'Bug',
//       column: task.column || 'To Do',
//       attachment: task.attachment || null,
//     };
//     await tasksCollection.insertOne(newTask);
//     const updatedTasks = await tasksCollection.find().toArray();
//     io.emit('sync:tasks', updatedTasks);
//   });

//   // Handle task update
//   socket.on('task:update', async (updatedTask) => {
//     await tasksCollection.updateOne(
//       { id: updatedTask.id },
//       { $set: updatedTask }
//     );
//     const updatedTasks = await tasksCollection.find().toArray();
//     io.emit('sync:tasks', updatedTasks);
//   });

//   // Handle task move
//   socket.on('task:move', async ({ id, column }) => {
//     await tasksCollection.updateOne(
//       { id },
//       { $set: { column } }
//     );
//     const updatedTasks = await tasksCollection.find().toArray();
//     io.emit('sync:tasks', updatedTasks);
//   });

//   // Handle task deletion
//   socket.on('task:delete', async (id) => {
//     await tasksCollection.deleteOne({ id });
//     const updatedTasks = await tasksCollection.find().toArray();
//     io.emit('sync:tasks', updatedTasks);
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected:', socket.id);
//   });
// });

// const PORT = process.env.PORT || 4000;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// // Graceful shutdown
// process.on('SIGTERM', async () => {
//   await client.close();
//   process.exit(0);
// });

// process.on('SIGINT', async () => {
//   await client.close();
//   process.exit(0);
// });


// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');
// const { MongoClient } = require('mongodb');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:3000',
//     methods: ['GET', 'POST'],
//   },
// });

// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// const uri = 'mongodb://localhost:27017/kanban'; // Local MongoDB
// const client = new MongoClient(uri);

// async function connectDB() {
//   try {
//     await client.connect();
//     console.log('Connected to MongoDB');
//     return client.db('kanban').collection('tasks');
//   } catch (error) {
//     console.error('MongoDB connection error:', error);
//     process.exit(1);
//   }
// }

// let tasksCollection;

// connectDB().then((collection) => {
//   tasksCollection = collection;
// });

// io.on('connection', (socket) => {
//   console.log('Client connected:', socket.id);

//   // Sync all tasks to newly connected client
//   (async () => {
//     const tasks = await tasksCollection.find().toArray();
//     socket.emit('sync:tasks', tasks);
//   })();

//   // Handle task creation
//   socket.on('task:create', async (task) => {
//     console.log('Creating task:', task); // Debug
//     const newTask = {
//       id: task.id || Date.now().toString(),
//       title: task.title || '',
//       description: task.description || '',
//       priority: task.priority || 'Low',
//       category: task.category || 'Bug',
//       column: task.column || 'To Do',
//       attachment: task.attachment, // Removed || null
//     };
//     await tasksCollection.insertOne(newTask).catch((err) => console.error('Insert error:', err));
//     const updatedTasks = await tasksCollection.find().toArray();
//     io.emit('sync:tasks', updatedTasks);
//   });

//   // Handle task update
//   socket.on('task:update', async (updatedTask) => {
//     console.log('Updating task:', updatedTask); // Debug
//     await tasksCollection.updateOne(
//       { id: updatedTask.id },
//       { $set: updatedTask }
//     ).catch((err) => console.error('Update error:', err));
//     const updatedTasks = await tasksCollection.find().toArray();
//     io.emit('sync:tasks', updatedTasks);
//   });

//   // Handle task move
//   socket.on('task:move', async ({ id, column }) => {
//     await tasksCollection.updateOne(
//       { id },
//       { $set: { column } }
//     );
//     const updatedTasks = await tasksCollection.find().toArray();
//     io.emit('sync:tasks', updatedTasks);
//   });

//   // Handle task deletion
//   socket.on('task:delete', async (id) => {
//     await tasksCollection.deleteOne({ id });
//     const updatedTasks = await tasksCollection.find().toArray();
//     io.emit('sync:tasks', updatedTasks);
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected:', socket.id);
//   });
// });

// const PORT = process.env.PORT || 4000;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// // Graceful shutdown
// process.on('SIGTERM', async () => {
//   await client.close();
//   process.exit(0);
// });

// process.on('SIGINT', async () => {
//   await client.close();
//   process.exit(0);
// });

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = 'mongodb://localhost:27017/kanban'; // Local MongoDB
const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('kanban').collection('tasks');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

let tasksCollection;

connectDB().then((collection) => {
  tasksCollection = collection;
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Sync all tasks to newly connected client
  (async () => {
    const tasks = await tasksCollection.find().toArray();
    socket.emit('sync:tasks', tasks);
  })();

  // Handle task creation
  socket.on('task:create', async (task) => {
    console.log('Creating task:', task); // Debug
    const newTask = {
      id: task.id || Date.now().toString(),
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'Low',
      category: task.category || 'Bug',
      column: task.column || 'To Do',
      attachment: task.attachment,
    };
    await tasksCollection.insertOne(newTask).catch((err) => console.error('Insert error:', err));
    const updatedTasks = await tasksCollection.find().toArray();
    io.emit('sync:tasks', updatedTasks);
  });

  // Handle task update
  socket.on('task:update', async (updatedTask) => {
    console.log('Updating task:', updatedTask); // Debug
    const { _id, ...updateData } = updatedTask; // Exclude _id from update
    await tasksCollection.updateOne(
      { id: updatedTask.id }, // Match by application-specific id
      { $set: updateData }
    ).catch((err) => console.error('Update error:', err));
    const updatedTasks = await tasksCollection.find().toArray();
    io.emit('sync:tasks', updatedTasks);
  });

  // Handle task move
  socket.on('task:move', async ({ id, column }) => {
    await tasksCollection.updateOne(
      { id },
      { $set: { column } }
    );
    const updatedTasks = await tasksCollection.find().toArray();
    io.emit('sync:tasks', updatedTasks);
  });

  // Handle task deletion
  socket.on('task:delete', async (id) => {
    await tasksCollection.deleteOne({ id });
    const updatedTasks = await tasksCollection.find().toArray();
    io.emit('sync:tasks', updatedTasks);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await client.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await client.close();
  process.exit(0);
});