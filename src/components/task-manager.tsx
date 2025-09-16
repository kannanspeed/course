import { ChangeEvent, useEffect, useState } from "react";
import { supabase } from "../supabase-client";
import { Session } from "@supabase/supabase-js";
import { checkAdminStatus } from "../utils/admin";

interface Task {
  id: number;
  title: string;
  description: string;
  created_at: string;
  image_url: string;
  email: string;
}

function TaskManager({ session }: { session: Session }) {
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newDescription, setNewDescription] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [taskImage, setTaskImage] = useState<File | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching tasks for user:', session.user.email);
      console.log('🔍 Session object:', session);
      
      const { error, data } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      console.log('🔍 Raw response:', { error, data });

      if (error) {
        console.error("❌ Error reading tasks: ", error.message);
        console.error("❌ Full error object:", error);
        // Set empty array instead of returning to prevent infinite loading
        setTasks([]);
        return;
      }

      console.log('✅ Tasks fetched successfully:', data);
      console.log('✅ Number of tasks:', data?.length || 0);
      setTasks(data || []);
    } catch (error) {
      console.error("❌ Exception in fetchTasks:", error);
      // Set empty array to prevent infinite loading
      setTasks([]);
    } finally {
      console.log('🔍 Setting loading to false');
      setLoading(false);
    }
  };

  const checkAdmin = async () => {
    try {
      console.log('🔍 Checking admin status for:', session.user.email);
      const adminStatus = await checkAdminStatus(session.user.email || '');
      console.log('🔍 Admin status result:', adminStatus);
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('❌ Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const deleteTask = async (id: number) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      console.error("Error deleting task: ", error.message);
      alert("Error deleting task: " + error.message);
      return;
    }
    
    console.log("Task deleted successfully, real-time update will handle UI refresh");
  };

  const updateTask = async (id: number) => {
    if (!newDescription.trim()) {
      alert("Please enter a description to update");
      return;
    }

    const { error } = await supabase
      .from("tasks")
      .update({ description: newDescription })
      .eq("id", id);

    if (error) {
      console.error("Error updating task: ", error.message);
      alert("Error updating task: " + error.message);
      return;
    }
    
    console.log("Task updated successfully, real-time update will handle UI refresh");
    setNewDescription(""); // Clear the input field
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const filePath = `${file.name}-${Date.now()}`;

    const { error } = await supabase.storage
      .from("tasks-images")
      .upload(filePath, file);

    if (error) {
      console.error("Error uploading image:", error.message);
      return null;
    }

    const { data } = await supabase.storage
      .from("tasks-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Check if title is empty
    if (!newTask.title.trim()) {
      console.error("Task title is required");
      alert("Please enter a task title");
      return;
    }

    let imageUrl: string | null = null;
    if (taskImage) {
      imageUrl = await uploadImage(taskImage);
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert({ ...newTask, email: session.user.email, image_url: imageUrl })
      .select()
      .single();

    if (error) {
      console.error("Error adding task: ", error.message);
      alert("Error adding task: " + error.message);
      return;
    }

    console.log("Task created successfully:", data);
    setNewTask({ title: "", description: "" });
    setTaskImage(null);
    
    // Refresh the task list
    fetchTasks();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTaskImage(e.target.files[0]);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Initializing TaskManager...');
      console.log('🚀 Session:', session);
      
      // Load tasks first, then check admin status (don't block on admin check)
      console.log('🚀 Starting fetchTasks...');
      await fetchTasks();
      
      // Check admin status in background (non-blocking)
      console.log('🚀 Starting admin check...');
      checkAdmin().catch(error => {
        console.error('❌ Admin check failed, continuing without admin features:', error);
      });
    };
    
    initializeApp();
  }, []);

  useEffect(() => {
    const channel = supabase.channel("tasks-channel");
    
    // Listen for INSERT events (new tasks)
    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tasks" },
        (payload) => {
          console.log("Real-time INSERT:", payload);
          const newTask = payload.new as Task;
          setTasks((prev) => [newTask, ...prev]);
        }
      )
      // Listen for UPDATE events (edited tasks)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tasks" },
        (payload) => {
          console.log("Real-time UPDATE:", payload);
          const updatedTask = payload.new as Task;
          setTasks((prev) => 
            prev.map(task => 
              task.id === updatedTask.id ? updatedTask : task
            )
          );
        }
      )
      // Listen for DELETE events (deleted tasks)
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "tasks" },
        (payload) => {
          console.log("Real-time DELETE:", payload);
          const deletedTask = payload.old as Task;
          setTasks((prev) => 
            prev.filter(task => task.id !== deletedTask.id)
          );
        }
      )
      .subscribe((status) => {
        console.log("Real-time subscription status:", status);
        if (status === 'SUBSCRIBED') {
          console.log("✅ Real-time updates are now active!");
        }
      });

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  console.log(tasks);

  if (loading) {
    return (
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem", textAlign: "center" }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2>Task Manager CRUD</h2>
        {isAdmin && (
          <div style={{ 
            background: "#ff6b6b", 
            color: "white", 
            padding: "0.5rem 1rem", 
            borderRadius: "4px",
            fontSize: "0.9rem",
            fontWeight: "bold"
          }}>
            🔑 ADMIN MODE
          </div>
        )}
      </div>
      
      {isAdmin && (
        <div style={{ 
          background: "#f8f9fa", 
          border: "1px solid #dee2e6", 
          borderRadius: "4px", 
          padding: "1rem", 
          marginBottom: "1rem" 
        }}>
          <h3 style={{ margin: "0 0 0.5rem 0", color: "#495057" }}>Admin Panel</h3>
          <p style={{ margin: "0", color: "#6c757d", fontSize: "0.9rem" }}>
            You can view, edit, and delete all users' tasks. Total tasks: <strong>{tasks.length}</strong>
          </p>
        </div>
      )}

      {/* Form to add a new task */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Task Title"
          value={newTask.title}
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, title: e.target.value }))
          }
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />
        <textarea
          placeholder="Task Description"
          value={newTask.description}
          onChange={(e) =>
            setNewTask((prev) => ({ ...prev, description: e.target.value }))
          }
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />

        <input type="file" accept="image/*" onChange={handleFileChange} />

        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Add Task
        </button>
      </form>

      {/* List of Tasks */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task, key) => (
          <li
            key={key}
            style={{
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "1rem",
              marginBottom: "0.5rem",
              position: "relative"
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <h3 style={{ margin: 0 }}>{task.title}</h3>
                {isAdmin && (
                  <div style={{ 
                    background: "#e9ecef", 
                    color: "#495057", 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "3px",
                    fontSize: "0.8rem",
                    fontWeight: "500"
                  }}>
                    👤 {task.email}
                  </div>
                )}
              </div>
              <p style={{ margin: "0 0 0.5rem 0" }}>{task.description}</p>
              {task.image_url && (
                <img src={task.image_url} style={{ height: 70, marginBottom: "0.5rem" }} alt="Task image" />
              )}
              <div>
                <textarea
                  placeholder="Updated description..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
                />
                <div>
                  <button
                    style={{ padding: "0.5rem 1rem", marginRight: "0.5rem" }}
                    onClick={() => updateTask(task.id)}
                  >
                    Edit
                  </button>
                  <button
                    style={{ padding: "0.5rem 1rem" }}
                    onClick={() => deleteTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      
      {tasks.length === 0 && (
        <div style={{ textAlign: "center", padding: "2rem", color: "#6c757d" }}>
          <p>No tasks found. {isAdmin ? "No users have created tasks yet." : "Create your first task above!"}</p>
        </div>
      )}
    </div>
  );
}

export default TaskManager;
