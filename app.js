//TODO: Style w stuff from that stack overflow comment
//TODO: Mousover close-button
//TODO: Big-ass titles instead of images
//TODO: delete infoprompt callback?
//TODO: Test + Refactor
//TODO: Eslint
//TODO: Ask for feedback from FCC and stackoverflow
//TODO: Find out why it's able to retrieve by ID despite not specifying one

const initial = () => {

   let recipesInit = {
      recipes: [
         {id: 1, title: 'Gorgonzola pie', ings: 'cheese, crust, sauce'},
         {id: 2, title: 'Parmesan di Siegfried Sassoon', ings: 'more cheese, chicken, roast'},
         {id: 3, title: 'Zuppa di Lentilli', ings: 'lentils probably, salt and pepper, cream, salt, pepper, yummy stuff, cheese, cheeesiness, flavourings, sugar, spices'}
      ],
      currentlySelected: 1
   }

   var retrievedObject = localStorage.getItem('recipesObject');
   let parsedRetrievedObject = JSON.parse(retrievedObject);
   console.log('parsedretrievedobject:', parsedRetrievedObject)
   console.log('recipesInit:', recipesInit)

   const noRecipesInLocalStorage = parsedRetrievedObject === null || parsedRetrievedObject.recipes.length == 0;

   if(noRecipesInLocalStorage) {
      return recipesInit;
   } else {
      return parsedRetrievedObject;
   }
}

// Reducer
const recipeReducer = (state = initial(), action) => {
   let newState = {};
   let newRecipes = [];

   switch (action.type) {

      case 'ADD_RECIPE':
         console.log(action);
         newRecipes = [...state.recipes, action];
         newState = Object.assign({}, state, {recipes: newRecipes})
         localStorage.setItem('recipesObject', JSON.stringify(newState));
         return newState;

      case 'DELETE_RECIPE':
         console.log(action);
         newRecipes = [
            ...state.recipes.slice(0, action.id),
            ...state.recipes.slice(action.id + 1)
         ];
         newState = Object.assign({}, state, {recipes: newRecipes});
         localStorage.setItem('recipesObject', JSON.stringify(newState));
         return newState;

      case 'CHANGE_SELECTED_RECIPE':
         console.log(action);
         return Object.assign({}, state, {currentlySelected: action.currentlySelected});

      case 'EDIT_RECIPE':
         console.log(action)
         newRecipes = [
            ...state.recipes.slice(0, action.id),
            action,
            ...state.recipes.slice(action.id + 1)
         ]
         newState = Object.assign({}, state, {recipes: newRecipes} )
         localStorage.setItem('recipesObject', JSON.stringify(newState));
         return newState;

      default:
         return state;

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
            if(data){
               store.dispatch({
                  type: 'EDIT_RECIPE',
                  id: this.state.currentlySelected,
                  title: data.editTitle,
                  ings: data.editIngs
               })
            }
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
               return (<li className="jumbotron row" key={i}>
                  <div>
                     <span className="list__close-button col-xs-1" onClick={ () => store.dispatch({id: i, type: 'DELETE_RECIPE'}) }>&times;</span>
                  </div>
                  <div>
                     <span className="list__title col-xs-11" onClick={this.infoPrompt.bind(this, i)}>{recipe.title}</span>
                  </div>
               </li>)
            })
         }</ul>
      )
   }
});

const Header = (props) => {
   return (
      <div className="header">
         <h5 className="header__mainTitle"><a href="http://github.com/alanbuchanan">My Tasty Recipes</a></h5>
         <div className="header__addButton-container">
            <div className="header__addButton" onClick={props.save}>
               <span className="header__addButton__text">+</span>
            </div>
         </div>
      </div>
   )
}

const RecipeBox = React.createClass({

   savePrompt() {
      vex.dialog.open({
         message: 'Add a Recipe',
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
      let {recipes} = this.props;
      return (
         <div>
            <Header save={this.savePrompt}/>
            <RecipeList recipes={store.getState().recipes}/>
         </div>
      )
   }
});

const render = () => ReactDOM.render(<RecipeBox />, document.getElementById('root'));
store.subscribe(render);
render();