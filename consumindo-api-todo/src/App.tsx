import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import axios from "axios";
import React from "react";

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

  const baseUrl = "https://todo-caio.azurewebsites.net/api/";
  const [targets, setTargets] = useState<Target[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoId, setTodoId] = useState<number>(0);
  const [targetId, setTargetId] = useState<number>(0);
  const [newTarget, setNewTarget] = useState({ title: "", description: "" });
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    targetId: 0,
  });

  const requestBase = axios.create({
    baseURL: baseUrl,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Carregar os dados ao montar o componente
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const targetsResponse = await requestBase.get("Targets");
      setTargets(targetsResponse.data);

      const todosResponse = await requestBase.get("Todo");
      setTodos(todosResponse.data);
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  const postTarget = async () => {
    try {
      const response = await requestBase.post("targets", {
        title: newTarget.title,
        description: newTarget.description,
        isComplete: false,
      });
      console.log("Novo Target criado:", response.data);
      getData(); // Atualizar os dados após criação
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  const postTodo = async () => {
    try {
      const response = await requestBase.post("Todo", {
        title: newTodo.title,
        description: newTodo.description,
        isComplete: false,
        targetId: newTodo.targetId,
      });
      console.log("Novo Todo criado:", response.data);
      getData(); // Atualizar os dados após criação
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  const deleteTarget = async (id: number) => {
    try {
      const confirmDelete = window.confirm(
        "Tem certeza que deseja excluir o target? Isso também excluirá as tarefas relacionadas ao objetivo."
      );
      if (confirmDelete) {
        await requestBase.delete(`targets/${id}`);
        console.log(`Target ${id} deletado.`);
        getData(); // Atualizar os dados após exclusão
      }
    } catch (error) {
      console.error("Erro ao deletar o target:", error);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await requestBase.delete(`todo/${id}`);
      console.log(`Todo ${id} deletado.`);
      getData(); // Atualizar os dados após exclusão
    } catch (error) {
      console.error("Erro ao deletar o todo:", error);
    }
  };
  const putComplete = async (id: number, newStatus: boolean) => {
    try {
      // Encontra o target atual na lista para pegar seus dados completos
      const targetToUpdate = targets.find((target) => target.id === id);

      if (!targetToUpdate) {
        console.error("Target não encontrado");
        return;
      }

      // Constrói o objeto para enviar no PUT, incluindo o campo 'todo'
      const updatedTarget = {
        id: targetToUpdate.id,
        title: targetToUpdate.title,
        isComplete: newStatus, // Atualiza apenas o campo isComplete
        description: targetToUpdate.description,
        todo: targetToUpdate.todos ? targetToUpdate.todos : [],
      };

      // Faz uma requisição PUT para atualizar o Target
      await requestBase.put(`targets/${id}`, updatedTarget);

      console.log(
        `Target ${id} atualizado para ${newStatus ? "Completo" : "Incompleto"}`
      );

      // Atualiza os dados chamando getData novamente
      getData();
    } catch (error) {
      console.error("Erro ao atualizar o status do target:", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="formTodoETarget">
          <div className="formTarget">
            <h2>Defina um objetivo!</h2>
            <input
              type="text"
              placeholder="Título do Target"
              value={newTarget.title}
              onChange={(e) =>
                setNewTarget({ ...newTarget, title: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Descrição do Target"
              value={newTarget.description}
              onChange={(e) =>
                setNewTarget({ ...newTarget, description: e.target.value })
              }
            />
            <button onClick={postTarget}>Estabelecer objetivo</button>
          </div>

          <div className="formTodo">
            <h2>Crie uma nova tarefa!</h2>
            <input
              type="text"
              placeholder="Título do Todo"
              value={newTodo.title}
              onChange={(e) =>
                setNewTodo({ ...newTodo, title: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Descrição do Todo"
              value={newTodo.description}
              onChange={(e) =>
                setNewTodo({ ...newTodo, description: e.target.value })
              }
            />
            <select
              value={newTodo.targetId}
              onChange={(e) =>
                setNewTodo({ ...newTodo, targetId: Number(e.target.value) })
              }
            >
              <option value={0}>Selecione um Target</option>
              {targets.map((target) => (
                <option key={target.id} value={target.id}>
                  {target.title}
                </option>
              ))}
            </select>
            {/* <input
            type="number"
            placeholder="Target ID"
            value={newTodo.targetId}
            onChange={(e) =>
              setNewTodo({ ...newTodo, targetId: Number(e.target.value) })
            }
          /> */}
            <button onClick={postTodo}>Criar tarefa</button>
          </div>
        </div>
        <div className="exibindoTodoEtarget">
          {targets?.map((target) => (
            <div className="container" key={target.id}>
              <div className="item">
                <input type="checkbox" id={`box-${target.id}`} />
                <label htmlFor={`box-${target.id}`}>{target.title}</label>
                <div>
                  <h3>{target.description}</h3>
                  {todos
                    .filter((todo) => todo.targetId === target.id) //</div> Filtra os todos pelo ta
                    .map((todo) => (
                      <div className="todosDiv" key={todo.id}>
                        <h4>{todo.title}</h4>
                        <p>{todo.description}</p>
                        <p>{todo.isComplete ? "Completo" : "Incompleto"}</p>
                        <button onClick={() => deleteTodo(todo.id)}>
                          Deletar Todo
                        </button>
                      </div>
                    ))}
                  {/* Caso o target não tenha todos */}
                  {todos.filter((todo) => todo.targetId === target.id)
                    .length === 0 && (
                    <p>Não há todos relacionados a este target.</p>
                  )}
                </div>
                <button onClick={() => deleteTarget(target.id)}>
                  Deletar Target
                </button>
              </div>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
};

export default App;
