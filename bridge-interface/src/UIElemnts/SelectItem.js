import Styles from "./SelectItem.module.css";

const SelectItem = (props) => {
  return (
    <div className={`${Styles.item} ${props.className}`}>
      <div className={Styles.title}>{props.label}</div>
      {props.children}
    </div>
  );
};

export default SelectItem;
