const initial = () => {
   let recipesInit = {
      recipes: [
         {id: 1, title: 'Pao de queijo', ings: '100ml milk, 100ml vegetable oil, Pinch of salt, 250g tapioca flour, 125g parmesan or vegetarian alternative, grated, 1 free-range egg'},
         {id: 2, title: 'Monastery Gyuvetch', ings: '2 lbs beef, 4 tomatoes, chopped, 1/2 lbs mushrooms, 1 cup rice, 1 onion, chopped, 15 olives, whole, a bunch of parsley, 2 tbsp vegetable oil, 1 tbsp butter, 1 tbsp sugar, 2 1/2 cups beef stock, black pepper, paprika and salt'},
         {id: 3, title: 'Hobaktteok', ings: '½ cup cooked butternut squash, ¼ cup honey, 2 tablespoon freshly squeezed lemon, 2 cups rice flour (frozen rice flour sold at a Korean grocery store or make your own), lemon zest from 1 lemon, 1 tablespoon water, ¼ teaspoon salt,2 tablespoons sugar'}
      ],
      currentlySelected: 1
   };

   var retrievedObject = localStorage.getItem('recipesObject');
   let parsedRetrievedObject = JSON.parse(retrievedObject);

   const noRecipesInLocalStorage = parsedRetrievedObject === null || parsedRetrievedObject.recipes.length == 0;

   if(noRecipesInLocalStorage) {
      return recipesInit;
   } else {
      return parsedRetrievedObject;
   }
};

// Reducer
const recipeReducer = (state = initial(), action) => {
   let newState = {};
   let newRecipes = [];

   switch (action.type) {
   case 'ADD_RECIPE':
      console.log(action);
      newRecipes = [...state.recipes, action];
      newState = Object.assign({}, state, {recipes: newRecipes});
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
      console.log(action);
      newRecipes = [
         ...state.recipes.slice(0, action.id),
         action,
         ...state.recipes.slice(action.id + 1)
      ];
      newState = Object.assign({}, state, {recipes: newRecipes} );
      localStorage.setItem('recipesObject', JSON.stringify(newState));
      return newState;

   default:
      return state;

   }
};

const {createStore} = Redux;
const store = createStore(recipeReducer);

const RecipeList = React.createClass({
   getInitialState(){
      return {
         currentlySelected: store.getState().currentlySelected
      };
   },

   editPrompt() {
      let current = store.getState().recipes[this.state.currentlySelected];

      vex.close();

      vex.dialog.open({
         message: 'Edit Recipe',
         input: `<input name="editTitle" type="text" value="${current.title}" />
               <textarea name="editIngs" rows="7">${current.ings}</textarea>`,
         buttons: [
            $.extend({}, vex.dialog.buttons.NO, {
               text: 'Cancel',
               click: () => vex.close()
            }),
            $.extend({}, vex.dialog.buttons.YES, {
               text: 'OK'
            })
         ],
         callback: data => {
            if(data){
               store.dispatch({
                  type: 'EDIT_RECIPE',
                  id: this.state.currentlySelected,
                  title: data.editTitle,
                  ings: data.editIngs
               });
            }
         }
      });
   },

   infoPrompt(i) {
      store.dispatch({
         type: 'CHANGE_SELECTED_RECIPE',
         currentlySelected: i
      });

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
            ]
         });
      });
   },

   render(){
      return (
         <ul className="col-xs-12">{
            this.props.recipes.map((recipe, i) => {
               return (<li className="jumbotron row" key={i}>
                  <div>
                     <span className="list__close-button col-xs-1" onClick={ () => store.dispatch({id: i, type: 'DELETE_RECIPE'}) }>&times;</span>
                  </div>
                  <div>
                     <span className="list__title col-xs-11" onClick={this.infoPrompt.bind(this, i)}>{recipe.title}</span>
                  </div>
               </li>);
            })
         }</ul>
      );
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
   );
};

const RecipeBox = React.createClass({
   savePrompt() {
      vex.dialog.open({
         message: 'Add a Recipe',
         input: `<input name="userTitle" type="text" placeholder="Name"/>
            <textarea name="userIngs" type="text" rows="7" placeholder="Ingredients/Cooking instructions"/>`,
         
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
      return (
         <div>
            <Header save={this.savePrompt}/>
            <RecipeList recipes={store.getState().recipes}/>
         </div>
      );
   }
});

const render = () => ReactDOM.render(<RecipeBox />, document.getElementById('root'));
store.subscribe(render);
render();