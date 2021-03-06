let menusByCategory = [];

const subCateArr = function(menus, menuCategory) {
  let subCategory = new Array();
  menus
    .filter(menu1 => menu1.menuCategory === menuCategory)
    .map(menu => {
      if (!subCategory.includes(menu.menuSubcategory))
        subCategory[menu.menuSubcategory] = menus
          .filter(
            item =>
              item.menuSubcategory === menu.menuSubcategory &&
              item.menuCategory === menu.menuCategory
          )
          .map(item => ({
            id: item.id,
            menuName: item.menuName,
            menuDescription: item.menuDescription,
            menuPrice: item.menuPrice
          }));
    });
  return subCategory;
};

const textReplace = (cartFormat, item, quantity) => {
  const { id, menuName, menuPrice, menuDescription } = item;
  let output = cartFormat.replace(/{%ID%}/g, id);
  output = output.replace(/{%NAME%}/g, menuName);
  output = output.replace(/{%PRICE%}/g, menuPrice.toFixed(2));
  output = output.replace(
    /{%DESCRIPTION%}/g,
    menuDescription === null ? "" : menuDescription
  );
  output = output.replace(/{%QUANTITY%}/g, quantity);
  return output;
};

const creatingInnerHtml = menusBySubCategory => {
  let menuItemSubategoryInnerHtml = "";
  for (let subcategory in menusBySubCategory) {
    let menuItems = menusBySubCategory[subcategory];
    let menuItemHtmlText = menuItems
      .map(menuItem => {
        return textReplace(menuItemHtml, menuItem, 1);
      })
      .join("");
    let menuItemSubategoryHtmlText = menuItemSubategoryHtml.replace(
      "{%SUBCATEGORY%}",
      subcategory
    );
    menuItemSubategoryHtmlText = menuItemSubategoryHtmlText.replace(
      "{%MENUITEMS%}",
      menuItemHtmlText
    );
    menuItemSubategoryInnerHtml += menuItemSubategoryHtmlText;
  }
  return menuItemSubategoryInnerHtml;
};

const filteringMenus = (menus, menuCategoryInput) => {
  menus.map(menu => {
    if (!Object.keys(menusByCategory).includes(menu.menuCategory))
      menusByCategory[menu.menuCategory] = Object.assign(
        {},
        subCateArr(menus, menu.menuCategory)
      );
  });
  let menuItemContainerInnerHtml = "";
  if (menuCategoryInput) {
    menus = menus.filter(menu => menu.menuCategory === menuCategoryInput);
    let filteredMenuItemCategoryHtmlText = menuItemCategoryHtml.replace(
      "{%CATEGORY%}",
      menuCategoryInput
    );
    let filteredMenuItemSubategoryInnerHtml = creatingInnerHtml(
      menusByCategory[menuCategoryInput]
    );

    filteredMenuItemCategoryHtmlText = filteredMenuItemCategoryHtmlText.replace(
      "{%SUBCATEGORIES%}",
      filteredMenuItemSubategoryInnerHtml
    );
    menuItemContainer.innerHTML = filteredMenuItemCategoryHtmlText;
  } else {
    for (let category in menusByCategory) {
      let menuItemCategoryHtmlText = menuItemCategoryHtml.replace(
        "{%CATEGORY%}",
        category
      );
      let menuItemSubategoryInnerHtml = creatingInnerHtml(
        menusByCategory[category]
      );

      menuItemCategoryHtmlText = menuItemCategoryHtmlText.replace(
        "{%SUBCATEGORIES%}",
        menuItemSubategoryInnerHtml
      );
      menuItemContainerInnerHtml += menuItemCategoryHtmlText;
    }
    menuItemContainer.innerHTML = menuItemContainerInnerHtml;
  }
  document.querySelectorAll(".menu-item-add-to-cart").forEach(menuItem =>
    menuItem.addEventListener("click", e => {
      setTimeout(() => e.target.blur(), 300);
      let cartItems = [];
      let id = e.target.dataset.id;
      let name = e.target.dataset.name;
      let price = parseFloat(e.target.dataset.price);
      let quantity = parseInt(e.target.dataset.quantity);
      if (localStorage.getItem("cartItems"))
        cartItems = JSON.parse(localStorage.getItem("cartItems"));
      cartItems.push(Object.assign({}, { id, name, price, quantity }));
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    })
  );
};

const displayMenu = async () => {
  const res = await fetch("./api/menus/");
  const menus = await res.json();
  if (localStorage.getItem("category")) {
    filteringMenus(menus, localStorage.getItem("category"));
  } else filteringMenus(menus);
  document.querySelectorAll(".food-category").forEach(categoryBtn =>
    categoryBtn.addEventListener("click", e => {
      setTimeout(() => e.target.blur(), 300);
      filteringMenus(menus, e.target.dataset.category);
    })
  );
};

displayMenu();
