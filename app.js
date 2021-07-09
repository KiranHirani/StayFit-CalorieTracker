//Storage Controller 
const StorageCtrl = (function () {


    return {
        storeItems: function (item) {
            let items = StorageCtrl.getItemsFromLS();
            items.push(item);
            localStorage.setItem('items', JSON.stringify(items));
        },
        getItemsFromLS: function () {
            let items;
            //Check if any item is in LS
            if (localStorage.getItem('items') === null) {
                items = []
            } else {
                items = JSON.parse(localStorage.getItem('items'))
            }
            return items;
        },
        removeItemsFromLS:function(id){
            let items= StorageCtrl.getItemsFromLS();
            items.forEach((item, index)=>{
                if(id===item.id){
                    items.splice(index,1);
                }
            })
            localStorage.setItem('items',JSON.stringify(items));
        },
        updateItemStorage:function(updatedItem){
            let items = StorageCtrl.getItemsFromLS();
            items.forEach((item,index)=>{
                if(item.id===updatedItem.id){
                    items.splice(index,1,updatedItem);
                }
            })
            localStorage.setItem('items',JSON.stringify(items));
        },
        removeItemsFromStorage:function(){
            localStorage.removeItem('items');
        }
    }
})();

//Item Controller 
const ItemCtrl = (function () {
    //Item Constructor 
    const Item = function (id, name, calories) {
        this.id = id;
        this.name = name;
        this.calories = calories;
    }

    //Data Structure / State
    const data = {
        items: StorageCtrl.getItemsFromLS(),
        currentItem: null,// when we click on update, we want that to be the current item
        totalCalories: 0
    }

    return {
        getItems: function () {
            return data.items;
        },
        addItems: function (name, calories) {
            let ID;
            //Create ID 
            if (data.items.length > 0) {
                ID = data.items[data.items.length - 1].id + 1;
            } else {
                ID = 0;
            }

            //Calories to number
            calories = parseInt(calories);

            const newItem = new Item(ID, name, calories);

            //Add to items array
            data.items.push(newItem);

            return newItem;
        },
        logData: () => data,
        getTotalCalories: function () {
            let total = 0;

            //Loop thru items and add cals
            data.items.forEach(item => total += item.calories)

            //Set total cal in data structure
            data.totalCalories = total;

            //return 
            return data.totalCalories;
        },
        getItemById: function (id) {
            let found = null;
            //Loop thru the items 
            data.items.forEach((item) => {
                if (item.id === id) {
                    found = item;
                }
            })
            return found;
        },
        setCurrentItem: function (item) {
            data.currentItem = item;
        },
        getCurrentItem: function () {
            return data.currentItem;
        },
        updateItem: function (name, calories) {
            //Calories to number
            calories = parseInt(calories);
            let found = null;
            data.items.forEach((item) => {
                if (item.id === data.currentItem.id) {
                    item.name = name;
                    item.calories = calories;
                    found = item;
                }
            })
            return found;
        },
        deleteItem: function (id) {
            //Get the ids 
            const ids = data.items.map((item) => item.id);

            const index = ids.indexOf(id);

            //remove item
            data.items.splice(index, 1)
        },
        clearAllItems: function () {
            data.items = [];
        }
    }
})();


//UI Controller 
const UICtrl = (function () {

    const UISelectors = {
        itemList: '#item-list',
        addBtn: '.add-btn',
        itemNameInput: '#item-name',
        itemCaloriesInput: '#item-calories',
        totalCalories: '.total-calories',
        updateBtn: ".update-btn",
        deleteBtn: ".delete-btn",
        backBtn: ".back-btn",
        listItems: "#item-list li", // all li elements inside ul
        clearBtn: '.clear-btn'
    }

    return {
        populateItemList: (items) => {
            let html = '';
            items.forEach((item) => {
                html += `
                    <li id="item-${item.id}" class="collection-item">
                        <strong>${item.name}: </strong> <em>${item.calories} Calories</em>
                        <a href="#" class="secondary-content"><i class="edit-item fa fa-pencil"></i></a>
                    </li>
                `
            });
            document.querySelector(UISelectors.itemList).innerHTML = html;
        },
        getSelectors: () => UISelectors,
        getItemInput: function () {
            return {
                name: document.querySelector(UISelectors.itemNameInput).value,
                calories: document.querySelector(UISelectors.itemCaloriesInput).value
            }
        },
        addListItem: function (newItem) {
            document.querySelector(UISelectors.itemList).style.display = "block"; //Hide the list
            //Create li element 
            const li = document.createElement('li');
            li.id = `item-${newItem.id}`;
            li.className = "collection-item";
            li.innerHTML = `<strong>${newItem.name}: </strong> <em>${newItem.calories} Calories</em>
                <a href="#" class="secondary-content"><i class="edit-item fa fa-pencil"></i></a>`;

            //Insert item 
            document.querySelector(UISelectors.itemList).insertAdjacentElement('beforeend', li);
        },
        clearFields: function () {
            document.querySelector(UISelectors.itemNameInput).value = '';
            document.querySelector(UISelectors.itemCaloriesInput).value = '';
        },
        hideList: function () {
            document.querySelector(UISelectors.itemList).style.display = "none"; //Hide the list
        },
        showCalories: function (totalCalories) {
            document.querySelector(UISelectors.totalCalories).textContent = totalCalories
        },
        clearEditState: function () {
            UICtrl.clearFields();

            //Hide these 3 buttons when we are not in the edit state
            document.querySelector(UISelectors.updateBtn).style.display = "none";
            document.querySelector(UISelectors.deleteBtn).style.display = "none";
            document.querySelector(UISelectors.backBtn).style.display = "none"
            document.querySelector(UISelectors.addBtn).style.display = "inline"
        },
        addItemToForm: function () {
            document.querySelector(UISelectors.itemNameInput).value = ItemCtrl.getCurrentItem().name;
            document.querySelector(UISelectors.itemCaloriesInput).value = ItemCtrl.getCurrentItem().calories;
            UICtrl.showEditState();
        },
        showEditState: () => {
            document.querySelector(UISelectors.updateBtn).style.display = "inline";
            document.querySelector(UISelectors.deleteBtn).style.display = "inline";
            document.querySelector(UISelectors.backBtn).style.display = "inline"
            document.querySelector(UISelectors.addBtn).style.display = "none"
        },
        updateListItem: (item) => {
            const listItems = document.querySelectorAll(UISelectors.listItems);

            listItems.forEach((listItem) => {
                const itemId = listItem.getAttribute('id');

                if (itemId === `item-${item.id}`) {
                    document.querySelector(`#${itemId}`).innerHTML = `<strong>${item.name}: </strong> <em>${item.calories} Calories</em>
                    <a href="#" class="secondary-content"><i class="edit-item fa fa-pencil"></i></a>`
                }
            })
        },
        deleteListItem: function (id) {
            const itemId = `#item-${id}`;
            const item = document.querySelector(itemId);
            item.remove();
        },
        removeItems: function () {
            const listItems = document.querySelectorAll(UISelectors.listItems);

            listItems.forEach((li) => {
                li.remove();
            })
        }
    }

})();

//App controller 
const AppCtrl = (function (ItemCtrl, UICtrl, StorageCtrl) {

    //Load Event Listeners
    const loadEventListeners = function () {
        const UISelectors = UICtrl.getSelectors();

        //Add item event 
        document.querySelector(UISelectors.addBtn).addEventListener('click', ItemAddSubmit);

        //Disable submit on enter
        document.addEventListener('keypress', (event) => {
            // 13 stands for enter 
            if (event.keyCode === 13 || event.which === 13) {
                event.preventDefault();
                return false;
            }
        })

        //Edit icon click event
        document.querySelector(UISelectors.itemList).addEventListener('click', ItemEditClick);

        //Update item event
        document.querySelector(UISelectors.updateBtn).addEventListener('click', ItemUpdateSubmit);

        //Back Button
        document.querySelector(UISelectors.backBtn).addEventListener('click', UICtrl.clearEditState)

        //Delete Item
        document.querySelector(UISelectors.deleteBtn).addEventListener('click', ItemDeleteSubmit);

        //Clear 
        document.querySelector(UISelectors.clearBtn).addEventListener('click', clearAllItemsClick);

    }

    const ItemAddSubmit = function (e) {

        //Get Form Input from Ui ctrl
        const input = UICtrl.getItemInput();

        //Check for name and calorie input
        if (input.name !== '' && input.calories !== '') {
            //Add Item 
            const newItem = ItemCtrl.addItems(input.name, input.calories)
            //Add item to UI list
            UICtrl.addListItem(newItem);

            //Get the total calories
            const totalCalories = ItemCtrl.getTotalCalories();

            //Add total calories to the UI
            UICtrl.showCalories(totalCalories);

            //Store in LS
            StorageCtrl.storeItems(newItem);

            UICtrl.clearFields();
        }

        e.preventDefault();
    }

    //Edit item
    const ItemEditClick = function (e) {
        if (e.target.classList.contains("edit-item")) {
            //Get list item id(item-0)
            const listId = e.target.parentNode.parentNode.id

            //Break into an array
            const listIdArr = listId.split('-');

            //get the actual id
            const id = parseInt(listIdArr[1]);

            //get item
            const itemToEdit = ItemCtrl.getItemById(id);

            //Set current item
            ItemCtrl.setCurrentItem(itemToEdit);

            UICtrl.addItemToForm();
        }
    }

    const ItemUpdateSubmit = function (e) {
        //Get item input
        const input = UICtrl.getItemInput();

        //Update item
        const updatedItem = ItemCtrl.updateItem(input.name, input.calories);

        //Update the UI
        UICtrl.updateListItem(updatedItem);

        //Get the total calories
        const totalCalories = ItemCtrl.getTotalCalories();

        //Add total calories to the UI
        UICtrl.showCalories(totalCalories);

        
        //Update LocalStorage
        StorageCtrl.updateItemStorage(updatedItem);

        UICtrl.clearEditState();

        e.preventDefault()
    }


    const ItemDeleteSubmit = function (e) {

        //get Current item 
        const currentItem = ItemCtrl.getCurrentItem();

        //Delete from Ds
        ItemCtrl.deleteItem(currentItem.id);

        //delete from ui
        UICtrl.deleteListItem(currentItem.id);

        //Get the total calories
        const totalCalories = ItemCtrl.getTotalCalories();

        //Add total calories to the UI
        UICtrl.showCalories(totalCalories);

        //Delete from LS
        StorageCtrl.removeItemsFromLS(currentItem.id);

        UICtrl.clearEditState();

        e.preventDefault();
    }


    //Clear Items event
    const clearAllItemsClick = function () {
        //Delete all items from data structure 
        ItemCtrl.clearAllItems();

        //Remove from UI
        UICtrl.removeItems();

        //Get the total calories
        const totalCalories = ItemCtrl.getTotalCalories();

        //Add total calories to the UI
        UICtrl.showCalories(totalCalories);

        StorageCtrl.removeItemsFromStorage();

        //Hide UL
        UICtrl.hideList();
    }

    //Public Methods
    return {
        init: function () {
            console.log('Initializing App');

            //clear edit state / set initial state
            UICtrl.clearEditState();

            //Fetch Items from DS
            const items = ItemCtrl.getItems();

            //Check if any items 
            if (items.length === 0) {
                UICtrl.hideList();
            } else {
                //Populate list with items
                UICtrl.populateItemList(items);
            }

            //Get the total calories
            const totalCalories = ItemCtrl.getTotalCalories();

            //Add total calories to the UI
            UICtrl.showCalories(totalCalories);

            //Load Event Listeners
            loadEventListeners();
        }
    }

})(ItemCtrl, UICtrl, StorageCtrl);


AppCtrl.init()