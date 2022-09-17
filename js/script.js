const route = (event) =>{
    event.preventDefault;
    window.history.pushState({}, "", event.target.href);
    router();
}

const routes = {
    404 : {route: '/pages/404.html', title: '404'},
    '/' : {route: '/pages/todo_form.html', title: 'To-Do Form'},
    '/todo-list' : {route: '/pages/todo_list.html', title: 'To-Do List'},
    '/api-data' : {route: '/pages/api_data.html', title: 'API Data'},
}

const router = async () =>{
    const path = window.location.pathname;
    const {route, title} = routes[path] || routes[404];
    const html = await fetch(route).then((data) => data.text());
    document.getElementById('main-page').innerHTML = html;
    document.title = title;
    includeScript(path);
}

window.route = route;
window.onpopstate = router;

router();

const includeScript = (path) => {
    switch (path) {
        case '/':
            const submit_btn = document.getElementById('todo_submit');
            submit_btn.addEventListener('click', function(e){
                e.preventDefault();
                const title = document.getElementById('title');
                const body = document.getElementById('body');
                const date = document.getElementById('date');

                const validation = {hasErrors: false};
                document.querySelectorAll('.input-error').forEach(e => e.remove());
                validate({value: title.value, field: 'title'}, validation);
                validate({value: body.value, field: 'body'}, validation);

                if(!validation.hasErrors){
                    const todos = JSON.parse(localStorage.getItem("todos")) || [];
                    const id = todos.length ? Math.max(...todos.map(todo => todo.id)) + 1 : 0;

                    const data = ({title:title.value, body:body.value, date:date.value, status:1, id});
                    const newTodos = [...todos, data];
                    localStorage.setItem("todos", JSON.stringify(newTodos));

                    Swal.fire({
                        icon: 'success',
                        title: 'To-Do saved succesfully!',
                    })
                    console.log(JSON.parse(localStorage.getItem("todos")));
                    title.value = '';
                    body.value = '';
                    date.value = '';
                }else{
                    Swal.fire({
                        icon: 'error',
                        title: 'Please complete all required fields.',
                    })
                }
            });
            break;

        case '/todo-list':
            const loadTodos = () => {
                const container = document.querySelector('#todo-list .grid');
                const todos = JSON.parse(localStorage.getItem("todos")) || [];
                container.innerHTML = '';
                if(!todos.length){
                    container.innerHTML = '<p>No To-Dos added yet.</p>';
                }else{
                    for (const todo of todos) {
                        const outerDiv = document.createElement("div");
                        const innerDiv = document.createElement("div");
                        const title = document.createElement("h3");
                        const body = document.createElement("p");
                        const edit = document.createElement("button");    
                        const remove = document.createElement("button");    
    
                        innerDiv.classList.add("todo");
                        title.innerText = todo.title;
                        body.innerText = todo.body;
                        edit.innerText = 'Edit';
                        edit.classList.add("edit-btn");
                        edit.setAttribute("data-id", todo.id);
                        remove.innerText = 'Remove';
                        remove.classList.add("delete-btn");
                        remove.setAttribute("data-id", todo.id);
    
                        innerDiv.appendChild(title);
                        innerDiv.appendChild(body);
                        innerDiv.appendChild(edit);
                        innerDiv.appendChild(remove);
                        outerDiv.appendChild(innerDiv);
                        container.appendChild(outerDiv);
                    }
                    
                    const edit_btns = document.getElementsByClassName("edit-btn");
                    Array.from(edit_btns).forEach(function(element) {
                        element.addEventListener('click', function(e){
                            const update_btn = document.getElementById("update_btn")
                            const id = e.target.dataset.id;
                            update_btn.setAttribute("data-id", id);
                            $('#updateModal').modal('show');
                        });
                    });
                    const delete_btns = document.getElementsByClassName("delete-btn");
                    Array.from(delete_btns).forEach(function(element) {
                        element.addEventListener('click', function(e){
                            const id = e.target.dataset.id
                            const todos = JSON.parse(localStorage.getItem("todos")) || [];
                            const newTodos = todos.filter((todo) => todo.id != id);
                            Swal.fire({
                                title: 'Are you sure?',
                                text: "You won't be able to revert this!",
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'Yes, delete it!'
                            }).then((result) => {
                            if (result.isConfirmed) {
                                localStorage.setItem("todos", JSON.stringify(newTodos));
                                loadTodos();
                                Swal.fire(
                                'Removed!',
                                'The To-Do has been removed.',
                                'success'
                                )
                            }
                            })
                        });
                    });
                }
            }
            const update_btn = document.getElementById("update_btn");
            update_btn.addEventListener('click', function(e){
                e.preventDefault();
                const id = e.target.dataset.id;
                const todos = JSON.parse(localStorage.getItem("todos")) || [];
                for (const [i, value] of todos.entries()) {
                    if(value.id == id){
                        const title = document.getElementById('title');
                        const body = document.getElementById('body');
                        const date = document.getElementById('date');

                        const validation = {hasErrors: false};
                        document.querySelectorAll('.input-error').forEach(e => e.remove());
                        validate({value: title.value, field: 'title'}, validation);
                        validate({value: body.value, field: 'body'}, validation);

                        if(!validation.hasErrors){
                            todos[i] = {title:title.value, body:body.value, date:date.value, status:1, id};
                            localStorage.setItem("todos", JSON.stringify(todos));

                            Swal.fire({
                                icon: 'success',
                                title: 'To-Do saved succesfully!',
                            })
                            console.log(JSON.parse(localStorage.getItem("todos")));
                            title.value = '';
                            body.value = '';
                            date.value = '';
                            localStorage.setItem("todos", JSON.stringify(todos));
                            loadTodos();
                            $('#updateModal').modal('hide');
                        }else{
                            Swal.fire({
                                icon: 'error',
                                title: 'Please complete all required fields.',
                            })
                        }
                        
                    }
                }
            });

            loadTodos();
            break;

        case '/api-data':
            const getPokemons = async() => {
                const pokemons = await fetch('https://pokeapi.co/api/v2/pokemon/').then(res => res.json()).then(data => data.results);
                pokemons.sort((a, b) => a.name.localeCompare(b.name));
                const pokemon_table = document.getElementById("pokemon_table");
                for (const [i, pokemon] of pokemons.entries()) {
                    pokemon_table.innerHTML+= `
                                                 <tr>
                                                    <th>${i + 1}</th>
                                                    <td>${pokemon.name}</td>
                                                </tr>`
                }  
            }
            getPokemons();
            break;
    
    }
    const validate = ({value, field}, validation) => {
        const inputField = document.getElementById(`${field}`);
        if(!value){
            validation.hasErrors = true;

            const p = document.createElement("p");
            p.innerText = `The ${field} field is required.`;    
            p.classList.add('input-error');       
            inputField.before(p)
        }
    }
}