import { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Container,
  Typography,
  Button,
  Icon,
  Paper,
  Box,
  TextField,
  Checkbox,
} from "@material-ui/core";
import { ITodo, ITodos } from "./types";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";


const reorder = (list: any, startIndex: any, endIndex: any) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};


const useStyles = makeStyles({
  addTodoContainer: { padding: 10 },
  addTodoButton: { marginLeft: 5 },
  todosContainer: { marginTop: 10, padding: 10 },
  todoContainer: {
    borderTop: "1px solid #bfbfbf",
    marginTop: 5,
    "&:first-child": {
      margin: 0,
      borderTop: "none",
    },
    "&:hover": {
      "& $deleteTodo": {
        visibility: "visible",
      },
    },
  },
  todoTextCompleted: {
    textDecoration: "line-through",
  },
  deleteTodo: {
    visibility: "hidden",
  },
});

const grid = 8;
const getItemStyle = (isDragging: any, draggableStyle: any) => ({
  userSelect: "none",
  margin: `0 0 ${grid}px 0`,
  background: isDragging ? "grey" : "white",
  ...draggableStyle
});

const getListStyle = (isDraggingOver: any) => ({
  background: isDraggingOver ? "lightblue" : "white",
});

function Todos() {
  const classes = useStyles();
  const [todos, setTodos] = useState<ITodos>([]);
  const [newTodoText, setNewTodoText] = useState<string>("");
  const [textValid, setTextValid] = useState<boolean>(true);


  const onDragEnd = (result: any) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    const newTodos: any = reorder(
      todos,
      result.source.index,
      result.destination.index
    );
    setTodos(newTodos);

    fetch(`http://localhost:3001/reorder`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        sourceId: todos[result.source.index].id,
        destinationId: todos[result.destination.index].id
      }),
    }).then(() => {});
  }

  useEffect(() => {
    fetch("http://localhost:3001/")
      .then((response) => response.json())
      .then((todos) => setTodos(todos));
  }, [setTodos]);

  const addTodo = (text: string): void => {
    if (textValid) {
      fetch("http://localhost:3001/", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ text }),
      })
        .then((response) => response.json())
        .then((todo) => setTodos([...todos, todo]));
      setNewTodoText("");
    }
  }

  const toggleTodoCompleted = (id: string): void => {
    fetch(`http://localhost:3001/${id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({
        completed: !(todos.find((todo: ITodo) => todo.id === id) as ITodo).completed,
      }),
    }).then(() => {
      const newTodos = [...todos];
      const modifiedTodoIndex = newTodos.findIndex((todo) => todo.id === id);
      newTodos[modifiedTodoIndex] = {
        ...newTodos[modifiedTodoIndex],
        completed: !newTodos[modifiedTodoIndex].completed,
      };
      setTodos(newTodos);
    });
  }

  const deleteTodo = (id: string): void => {
    fetch(`http://localhost:3001/${id}`, {
      method: "DELETE",
    }).then(() => setTodos(todos.filter((todo: ITodo) => todo.id !== id)));
  }

  useEffect(() => {
    if (newTodoText) {
      setTextValid(true)
    } else {
      setTextValid(false)
    }
  }, [newTodoText]);


  return (
    <Container maxWidth="md">
      <Typography variant="h3" component="h1" gutterBottom>
        Todos
      </Typography>
      <Paper className={classes.addTodoContainer}>
        <Box display="flex" flexDirection="row">
          <Box flexGrow={1}>
            <TextField
              fullWidth
              error={!textValid}
              helperText={!textValid ? "Text feild could not be empty" : ""}
              value={newTodoText}
              onKeyPress={(event: any) => {
                if (event.key === "Enter") {
                  addTodo(newTodoText);
                }
              }}
              onChange={(event: any) => setNewTodoText(event.target.value)}
            />
          </Box>
          <Button
            className={classes.addTodoButton}
            startIcon={<Icon>add</Icon>}
            onClick={() => addTodo(newTodoText)}
          >
            Add
          </Button>
        </Box>
      </Paper>
      {todos.length > 0 && (

        <Paper className={classes.todosContainer}>
          <Box display="flex" flexDirection="column" alignItems="stretch">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                  >
                    {todos.map(({ id, text, completed }: ITodo, index: number) => (
                      <Draggable key={id} draggableId={id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(
                              snapshot.isDragging,
                              provided.draggableProps.style
                            )}
                            className={classes.todoContainer}
                          >
                            <Box
                              key={id}
                              display="flex"
                              flexDirection="row"
                              alignItems="center"
                            >
                              <Checkbox
                                checked={completed}
                                onChange={() => toggleTodoCompleted(id)}
                              ></Checkbox>
                              <Box flexGrow={1}>
                                <Typography
                                  className={completed ? classes.todoTextCompleted : ""}
                                  variant="body1"
                                >
                                  {text}
                                </Typography>
                              </Box>
                              <Button
                                className={classes.deleteTodo}
                                startIcon={<Icon>delete</Icon>}
                                onClick={() => deleteTodo(id)}
                              >
                                Delete
                              </Button>
                            </Box>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Box>
        </Paper>
      )}



      {todos.length > 0 && (
        <Paper className={classes.todosContainer}>
          <Box display="flex" flexDirection="column" alignItems="stretch">

            {todos.map(({ id, text, completed }) => (
              <Box
                key={id}
                display="flex"
                flexDirection="row"
                alignItems="center"
                className={classes.todoContainer}
              >
                <Checkbox
                  checked={completed}
                  onChange={() => toggleTodoCompleted(id)}
                ></Checkbox>
                <Box flexGrow={1}>
                  <Typography
                    className={completed ? classes.todoTextCompleted : ""}
                    variant="body1"
                  >
                    {text}
                  </Typography>
                </Box>
                <Button
                  className={classes.deleteTodo}
                  startIcon={<Icon>delete</Icon>}
                  onClick={() => deleteTodo(id)}
                >
                  Delete
                </Button>
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Container>
  );
}

export default Todos;
