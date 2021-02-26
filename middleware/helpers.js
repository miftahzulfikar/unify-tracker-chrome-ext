const componentList = [
  {
    id: 1,
    name: "Button",
    selector: "*[class*='unf-btn']",
  },
  {
    id: 2,
    name: "Card",
    selector: "*[class*='unf-card']",
  },
];

const getComponentDataById = (id) => {
  return componentList.find((x) => x.id === parseInt(id));
};

exports.componentList = componentList;
exports.getComponentDataById = getComponentDataById;
