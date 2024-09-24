import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import axios from 'axios';
import React from 'react';

const App: React.FC = () => {
  interface Todo {
    id: number;
    title: string;
    description: string;
    isComplete: boolean;
    targetId: number;
  }

  interface Target {
    id: number;
    title: string;
    description: string;
    isComplete: boolean;
    todos: Todo[];
  }

  const baseUrl = 'https://todo-caio.azurewebsites.net/api/';
  const [targets, setTargets] = useState<Target[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoId, setTodoId] = useState<number>(0);
  const [targetId, setTargetId] = useState<number>(0);
  const [newTarget, setNewTarget] = useState({ title: '', description: '' });
  const [newTodo, setNewTodo] = useState({ title: '', description: '', targetId: 0 });

  

  const requestBase = axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Carregar os dados ao montar o componente
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const response = await requestBase.get('Targets');
      setTargets(response.data);
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  };

  const postTarget = async () => {
    try {
      const response = await requestBase.post('targets', {
        title: newTarget.title,
        description: newTarget.description,
        isComplete: false,
      });
      console.log('Novo Target criado:', response.data);
      getData(); // Atualizar os dados após criação
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  };

  const postTodo = async () => {
    try {
      const response = await requestBase.post('Todo', {
        title: newTodo.title,
        description: newTodo.description,
        isComplete: false,
        targetId: newTodo.targetId,
      });
      console.log('Novo Todo criado:', response.data);
      getData(); // Atualizar os dados após criação
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  };

  const deleteTarget = async (id: number) => {
    try {
      await requestBase.delete(`targets/${id}`);
      console.log(`Target ${id} deletado.`);
      getData(); // Atualizar os dados após exclusão
    } catch (error) {
      console.error('Erro ao deletar o target:', error);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await requestBase.delete(`todo/${id}`);
      console.log(`Todo ${id} deletado.`);
      getData(); // Atualizar os dados após exclusão
    } catch (error) {
      console.error('Erro ao deletar o todo:', error);
    }

    
  };
  const putComplete = async (id: number, newStatus: boolean) => {
    try {
      // Encontra o target atual na lista para pegar seus dados completos
      const targetToUpdate = targets.find(target => target.id === id);
      
      if (!targetToUpdate) {
        console.error('Target não encontrado');
        return;
      }
  
      // Constrói o objeto para enviar no PUT, incluindo o campo 'todo'
      const updatedTarget = {
        id: targetToUpdate.id,
        title: targetToUpdate.title,
        isComplete: newStatus, // Atualiza apenas o campo isComplete
        description: targetToUpdate.description,
        todo: targetToUpdate.todos ? targetToUpdate.todos : []
      };
  
      // Faz uma requisição PUT para atualizar o Target
      await requestBase.put(`targets/${id}`, updatedTarget);
      
      console.log(`Target ${id} atualizado para ${newStatus ? 'Completo' : 'Incompleto'}`);
      
      // Atualiza os dados chamando getData novamente
      getData();
    } catch (error) {
      console.error('Erro ao atualizar o status do target:', error);
    }
  };
  
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={reactLogo} className="App-logo" alt="logo" />
        <img src={viteLogo} className="App-logo" alt="logo" />

        <div>
          <h2>Criar novo Target</h2>
          <input
            type="text"
            placeholder="Título do Target"
            value={newTarget.title}
            onChange={(e) => setNewTarget({ ...newTarget, title: e.target.value })}
          />
          <input
            type="text"
            placeholder="Descrição do Target"
            value={newTarget.description}
            onChange={(e) => setNewTarget({ ...newTarget, description: e.target.value })}
          />
          <button onClick={postTarget}>Criar Target</button>
        </div>

        <div>
          <h2>Criar novo Todo</h2>
          <input
            type="text"
            placeholder="Título do Todo"
            value={newTodo.title}
            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
          />
          <input
            type="text"
            placeholder="Descrição do Todo"
            value={newTodo.description}
            onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
          />
          <input
            type="number"
            placeholder="Target ID"
            value={newTodo.targetId}
            onChange={(e) => setNewTodo({ ...newTodo, targetId: Number(e.target.value) })}
          />
          <button onClick={postTodo}>Criar Todo</button>
        </div>

        <h2>Targets</h2>
        {targets?.map((target) => (
          <div key={target.id}>
            <h3>{target.title}</h3>
            <p>{target.description}</p>
            <label>
            <p>{target.isComplete ? 'Completo' : 'Incompleto'}</p>
              <input
                type="checkbox"
                checked={target.isComplete} // Define se a checkbox está marcada ou não
                onChange={() => putComplete(target.id, !target.isComplete)} // Altera o estado quando clicada
              />
            </label>
            <button onClick={() => deleteTarget(target.id)}>Deletar Target</button>
          </div>
        ))}

        <h2>Todos</h2>
        {todos?.map((todo) => (
          <div key={todo.id}>
            <h3>{todo.title}</h3>
            <p>{todo.description}</p>
            <p>{todo.isComplete ? 'Completo' : 'Incompleto'}</p>
            <button onClick={() => deleteTodo(todo.id)}>Deletar Todo</button>
          </div>
        ))}
      </header>
    </div>
  );
};

export default App;
