

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
			let newRecipes = [...state.recipes, action];
			return Object.assign({}, state, {recipes: newRecipes})
			break;
		case 'DELETE_RECIPE':
			console.log('id', action.id)
			let recipesWithDeletion = [
				...state.recipes.slice(0, action.id),
				...state.recipes.slice(action.id + 1)
			];
			return Object.assign({}, state, {recipes: recipesWithDeletion});
			break;
		case 'CHANGE_SELECTED_RECIPE':
			console.log('change selected recipe action:', action)
			return Object.assign({}, state, {currentlySelected: action.currentlySelected});
		case 'EDIT_RECIPE':
			return state;
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
		console.log('cirr:', current)
		vex.close()
		vex.dialog.open({
			message: 'Edit Recipe',
			input: `<input type="text" value=${current.title} />`,
			callback: () => {}
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
						text: 'OK'
					}), $.extend({}, vex.dialog.buttons.NO, {
						text: 'Edit',
						click: () => this.editPrompt()
					})
				],
				callback: data => {

		    		if (data === false) {return console.log('Cancelled');}

		    		console.log('Date', data.userTitle, 'Color', data.userIngs);
					store.dispatch({
						type: 'ADD_RECIPE',
						id: Date.now(),
						title: data.userTitle,
						ings: data.userIngs
					});
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

	    		if (data === false) {return console.log('Cancelled');}

	    		console.log('Date', data.userTitle, 'Color', data.userIngs);
				store.dispatch({
					type: 'ADD_RECIPE',
					id: Date.now(),
					title: data.userTitle,
					ings: data.userIngs
				});
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