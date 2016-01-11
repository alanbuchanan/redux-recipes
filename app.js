//TODO: Local storage stuff (get on init, set on save)
//TODO: Test + Refactor
//TODO: Style

const initial = () => {
	return {
		recipes: [
			{id: 1, title: 'Gorgonzola pie', ings: 'cheese, crust, sauce'},
			{id: 2, title: 'Parmesan di Siegfried Sassoon', ings: 'more cheese, chicken, roast'},
			{id: 3, title: 'Zuppa di Lentilli', ings: 'lentils probably, salt and pepper, cream, salt, pepper, yummy stuff, cheese, cheeesiness, flavourings, sugar, spices'}
		],
		currentlySelected: 1
	}
}

// Reducer
const recipeReducer = (state = initial(), action) => {
	switch (action.type) {

		case 'ADD_RECIPE':
			console.log(action);
			let newRecipes = [...state.recipes, action];
			return Object.assign({}, state, {recipes: newRecipes})
			break;

		case 'DELETE_RECIPE':
			console.log(action);
			let recipesWithDeletion = [
				...state.recipes.slice(0, action.id),
				...state.recipes.slice(action.id + 1)
			];
			return Object.assign({}, state, {recipes: recipesWithDeletion});
			break;

		case 'CHANGE_SELECTED_RECIPE':
			console.log(action);
			return Object.assign({}, state, {currentlySelected: action.currentlySelected});

		case 'EDIT_RECIPE':
			console.log(action)
			let editedRecipes = [
				...state.recipes.slice(0, action.id),
				action,
				...state.recipes.slice(action.id + 1)
			]
			return Object.assign({}, state, {recipes: editedRecipes} )
			break;

		default:
			return state;
			break;
	};
};

const {createStore} = Redux;
const store = createStore(recipeReducer);

const RecipeList = React.createClass({

	getInitialState(){
		return {
			currentlySelected: store.getState().currentlySelected
		}
	},

	editPrompt() {
		let current = store.getState().recipes[this.state.currentlySelected];
		vex.close()
		vex.dialog.open({
			message: 'Edit Recipe',
			input: `<input name="editTitle" type="text" value="${current.title}" />
					<textarea name="editIngs">${current.ings}</textarea>`,
			buttons: [
				$.extend({}, vex.dialog.buttons.YES, {
					text: 'OK'
				}), $.extend({}, vex.dialog.buttons.NO, {
					text: 'Cancel',
					click: () => vex.close()
				})
			],
			callback: data => {
				store.dispatch({
					type: 'EDIT_RECIPE',
					id: this.state.currentlySelected,
					title: data.editTitle,
					ings: data.editIngs
				})
			}
		})
	},

	infoPrompt(i, e) {
		
		store.dispatch({
			type: "CHANGE_SELECTED_RECIPE",
			currentlySelected: i
		})

		this.setState({currentlySelected: i}, () => {

			let current = store.getState().recipes[this.state.currentlySelected];
			vex.dialog.open({
				message: `<h1>${current.title}</h1> \n ${current.ings}`,
				input: '',
				buttons: [
					$.extend({}, vex.dialog.buttons.YES, {
						text: 'Cancel'
					}), $.extend({}, vex.dialog.buttons.NO, {
						text: 'Edit',
						click: () => this.editPrompt()
					})
				],
				callback: data => {
		    		if (data === false) {return console.log('Cancelled');};
				}
			});
		});
	},

	render(){
		return (
			<ul>{
				this.props.recipes.map((recipe, i) => {
					return (<li key={i}>
						<span onClick={this.infoPrompt.bind(this, i)}>{recipe.title}</span>&nbsp;
						<button onClick={ () => store.dispatch({id: i, type: 'DELETE_RECIPE'}) }>x</button>
					</li>)
				})
			}</ul>
		)
	}
});

const RecipeBox = React.createClass({

	savePrompt() {
		vex.dialog.open({
			message: 'Add an item',
			input: `<input name="userTitle" type="text" placeholder="Name"/>
				<textarea name="userIngs" type="text" placeholder="Ingredients/Cooking instructions"/>`,
			
			callback: data => {
				if(data) {
					store.dispatch({
						type: 'ADD_RECIPE',
						id: Date.now(),
						title: data.userTitle,
						ings: data.userIngs
					});
				}
			}
		});
	},

	render() {
		let {recipes, add} = this.props;
		return (
			<div>
				<RecipeList recipes={recipes}/>
				<button onClick={this.savePrompt}>Add a recipe!</button>
			</div>
		)
	}
});


const Main = React.createClass({

	render() {
		console.log(store.getState())
		return (
			<RecipeBox
				add={ () => store.dispatch({type: 'ADD_RECIPE'}) }
				recipes={store.getState().recipes}
			/>
		);
	}
});

const render = () => ReactDOM.render(<Main />, document.getElementById('root'));
store.subscribe(render);
render();