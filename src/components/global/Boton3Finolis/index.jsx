// Dependencies
import React, { Component } from 'react';
import PropTypes from 'prop-types';
// Assets
import './css/Boton3.css';



class BotonFinolis extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    icon1: PropTypes.string,
    icon2: PropTypes.string,
    texto: PropTypes.string.isRequired,
    display: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.onClick = this.onClick.bind(this);
  }
  onClick(e) {
    
    if (this.props.onClick != null && this.props.onClick != undefined) {
     
      if (this.props.disabled == undefined || this.props.disabled == false) {
        this.props.onClick(e);
      } else {
        if (this.props.infoDisabled == undefined || this.props.infoDisabled == false) {
          swal('Boton deshabilitado', '', 'info')
        } else {
          swal('Boton deshabilitado', '' + this.props.infoDisabled + '', 'info')
        }
      }

    }
  }
  render() {
    const { id, icon1, icon2, texto, display, disabled } = this.props;
    return (

      <div className={disabled == undefined || disabled == false ? ("boton3") : ("boton3Desactivado")} id={id} onClick={this.onClick} style={{ display: display }}>
        <i className={icon1} id={id}></i>
        <div id={id}>{texto}</div>
        <i id={id} className={icon2}></i>
      </div>
    );
  }
}
export default BotonFinolis;
