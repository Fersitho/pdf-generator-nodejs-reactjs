// Dependencies
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Redirect } from 'react-router-dom'
import moment from 'moment'
import $ from 'jquery';
import ReactPlayer from 'react-player'
import ReactHtmlParser from 'react-html-parser';
//Assets
import './css/claseCej.css'
//Redux
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
// Actions
import { loadTestUser, loadCPUser, borrarTestUser, borrarCP, cronoFunc, loadCurso, loadClase, loadTemasFacturados, loadAllSemFac, loadSemanaPrg, loadTemaAula, loadSemanasCurso } from '../../actions/userAction'
// Utils
import { isDefined } from '../../lib/utils/is'
import { loadClaseCurso, filtrarClaseCurso, crearSemanasPrgCurso } from '../../lib/utils/cargarSemanaClase.js';
import { selectPreguntasPorIdTest, respuestasTestId, mezclarRespuestasJusticia, comprobarRespuestas, selectPreguntasPorIdTestCP, respuestasTestIdCP } from '../../lib/utils/cargarTestJusticia'


// Components

import Input from '../../components/Inputs/Input';
import InputSelect from '../../components/Inputs/InputSelect';
import BotonMedio from '../../components/Inputs/BotonMedio';

import InputFileExamDesa from '../../components/Inputs/InputFileExamDesa';
import Input2 from '../../components/Inputs/Input2';
import CajaInfoClase from '../../components/CajaInfoClase'
import CajaInfoTema from '../../components/CajaInfoTema'
import CajaInfoSemanaCurso from '../../components/CajaInfoSemanaCurso'


import Boton from '../../components/Inputs/Boton';
import TemaSeleted from '../../components/TemaSeleted'
import { Ellipsis } from '../../components/react-css-spinners'
import Ranking from '../../components/Ranking'
import swal from 'sweetalert';


import AulaVirtualTema from './components/AulaVirtualTema'


class AulaVirtualAlumnos extends Component {
  static propTypes = {
    isLogged: PropTypes.bool.isRequired,
    nombreUser: PropTypes.string.isRequired,
    tipoUser: PropTypes.number.isRequired,
    testJusticiaUserLoad: PropTypes.array,
    casoPracticoUserLoad: PropTypes.array
  };
  constructor(props) {
    super(props);
    this.state = {
      valueCursoBusqueda: null,
      semanasLoadBuscador: null,
      vidActual: 0,
      bloqueSelected: 0,
      temaSelected: 0,
      ejerciciosVer: false,
      testSelected: 0,
      tipoEjerSelected: null,
      mod: null,
      modoTemasEstudio: 'recomendacion',
      temasBusqueda: null,
      listadoTemasOn: null,
      modoRecomendacionEstudio: null
    };
    this.onChangeBuscador = this.onChangeBuscador.bind(this);

    this.onChangeInput = this.onChangeInput.bind(this);
    this.downloadPdf = this.downloadPdf.bind(this);
    this.myFiles = this.myFiles.bind(this);

    this.onClickTem = this.onClickTem.bind(this);

    this.onChangeBuscadorTemas = this.onChangeBuscadorTemas.bind(this)
    //this.onToggleClick = this.onToggleClick.bind(this);
    //this.handleClickToogle = this.handleClickToogle.bind(this);
    this.onHandleClick = this.onHandleClick.bind(this);
  }
  async myFiles(e) {
    if (e.target.name == 'examGest') {
      try {

        let files = e.target.files;
        let locaBloque = this.state.bloqueSelected
        let semanaPrg = this.props.semanaPrg
        var filesLoad = [];
        for (var i = 0; i < files.length; i++) {
          filesLoad.push(files[i]);
        }

        swal({
          title: "¿Estas segur@?",
          text: "Si le das a ok, el examen será enviado y no podra subir otro. La fecha máxima para que un preparador corriga su examen es el: "
            + moment(semanaPrg[0].FechaTestClase).add(7, 'd').format('DD-MM-YYYY') + ", si lo entrega despues de dicha fecha, será auto-evaluación por parte del alumno "
          ,
          icon: "warning",
          buttons: true,
          dangerMode: true,
        })
          .then(async (willDelete) => {
            if (willDelete) {

              semanaPrg[0].bloqueTemas[locaBloque].examenToUpload = filesLoad

              if (semanaPrg[0].bloqueTemas[locaBloque].examenToUpload != undefined && semanaPrg[0].bloqueTemas[locaBloque].examenToUpload.length > 0) {
                swal({
                  title: 'Subiendo Examen de Gestión',
                  text: ' ',
                  icon: "https://media.giphy.com/media/feN0YJbVs0fwA/giphy.gif",
                  buttons: false,
                  closeOnEsc: false,
                  closeOnClickOutside: false,
                })

                let data1 = new FormData();
                data1.append('myFiles', semanaPrg[0].bloqueTemas[locaBloque].examenToUpload[0]);
                if (data1.getAll('myFiles') && data1.getAll('myFiles').length == 1) {

                  let nombreArchivoOrig = data1.getAll('myFiles')[0].name
                  // let tipoArchivo = nombreArchivo.split('.')[1]

                  let nombreArchivo = '';
                  let tipoArchivo = ''
                  for (let i = 0; i < nombreArchivoOrig.split('.').length; i++) {
                    if (i == nombreArchivoOrig.split('.').length - 1) {
                      tipoArchivo = nombreArchivoOrig.split('.')[i]
                    } else {

                      if (i == nombreArchivoOrig.split('.').length - 2) {
                        nombreArchivo = nombreArchivo + nombreArchivoOrig.split('.')[i]
                      } else {
                        nombreArchivo = nombreArchivo + nombreArchivoOrig.split('.')[i] + '.'
                      }
                    }

                  }


                  if (tipoArchivo && tipoArchivo == 'pdf') {
                    let response1 = await fetch("https://oposiciones-justicia.es/uploadmultiple", {
                      method: 'POST', body: data1
                    });
                    if (!response1.ok) {
                      throw Error(response1.statusText);
                    }
                    let json1 = await response1.json();
                    let cls1 = await json1;
                    if (cls1 != undefined) {
                      let path = cls1[0].path.split('src/')[1];

                      let data3 = { idAlumno: this.props.idUser, idExamGes: semanaPrg[0].bloqueTemas[locaBloque].examenesDesarrollo[this.state.testSelected].idExamenGestion, idPrg: semanaPrg[0].idPrg, idBloque: semanaPrg[0].bloqueTemas[locaBloque].idBloque, idClase: semanaPrg[0].idClase, fecha: moment().format('YYYY-MM-DD HH:mm'), ruta: path }
                      let response3 = await fetch("https://oposiciones-justicia.es/api/usuarios/addExamGesCompleto", {
                        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data3)
                      });
                      if (!response3.ok) {
                        throw Error(response3.statusText);
                      }
                      let json3 = await response3.json();
                      let cls3 = await json3;
                      if (cls3 != undefined) {

                        // meter notificacion preparador
                        if (moment().format('YYYY-MM-DD') <= moment(semanaPrg[0].FechaTestClase).add(7, 'd').format('YYYY-MM-DD')) {
                          let data2 = {
                            idUserRecibe: 15,
                            idUserEnvia: this.props.idUser,
                            fecha: moment().format('YYYY-MM-DD HH:mm'),
                            titulo: 'Examen desarrollo',
                            notificacionTexto: 'Se acaba detectar el envio de un examen de gestión. ' + moment().format('DD-MM-YY HH:mm') + '.',
                            tipoPreparadores: 1,
                            tipoOficina: 0,
                            tipoDuda: 0,
                            tipoUrgente: 1,
                            tipoReformasLey: 0,
                            tipoExamenGestion: 1,
                            idDuda: null,
                            idPrg: semanaPrg[0].idPrg,
                            idClase: semanaPrg[0].idClase,
                            idBloque: semanaPrg[0].bloqueTemas[locaBloque].idBloque,
                            idExamenGestion: semanaPrg[0].bloqueTemas[locaBloque].examenesDesarrollo[this.state.testSelected].idExamenGestion
                          }
                          let response2 = await fetch("https://oposiciones-justicia.es/api/usuarios/enviarNotificacionExamen", {
                            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data2)
                          });
                          if (!response2.ok) {
                            throw Error(response2.statusText);
                          }
                          let json2 = await response2.json();
                          let cls2 = await json2;
                        }
                        //reload clasee
                        let claseLoad = await loadClaseCurso(this.props.semPrgLoadFactura, this.props.idUser, this.state.busquedaLeyes)
                        let filtroClase = await filtrarClaseCurso(claseLoad, this.props.tipoUser, this.props.userAccesoTemas, this.props.temasFacturados)

                        await this.props.loadSemanaPrg(filtroClase)
                        if (moment().format('YYYY-MM-DD') <= moment(semanaPrg[0].FechaTestClase).add(7, 'd').format('YYYY-MM-DD')) {
                          swal({
                            title: 'Examen subido correctamente',
                            text: 'Ya puede descargar la solución. Corregiremos el examen lo antes posible.',
                            icon: "success",
                            closeOnEsc: false,
                            closeOnClickOutside: false,
                          })
                        } else {
                          swal({
                            title: 'Examen subido correctamente',
                            text: 'Ya puede descargar la solución y realizar la auto-evaluación.',
                            icon: "success",
                            closeOnEsc: false,
                            closeOnClickOutside: false,
                          })
                        }

                      }

                    }

                  } else {
                    swal('Error en nombre de Archivo', 'No puede contener ningun punto "." y debe ser un archivo PDF', 'error')
                  }


                } else {
                  swal('Solo puede escoger un archivo en .pdf', '', 'error')
                }


              } else {
                swal('Tiene que introducir un archivo en .pdf', '', 'error')
              }
            } else {
              swal("¡Examen no subido!", '', "success");

              this.setState({ tipoEjerSelected: null, testSelected: 0 })
              this.setState({ tipoEjerSelected: 'testDesarrollo', testSelected: 0 })
            }
          });
      } catch (e) { console.log(e) }
    }

  }

  async onHandleClick(e) {
    if (e.target.id == 'closeClaseOpen') {
      this.props.loadTemaAula(null)
    } else if (e.target.id == 'completarVuelta') {

      //obtener vueltas del tema 
      swal({
        title: "¿Estas segur@?",
        text: "Si le das a ok, se completara una vuelta de estudio al tema.",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
        .then(async (willDelete) => {
          if (willDelete) {
            let data33 = { idUser: this.props.idUser, idTema: this.props.temaAulaLoad }

            let response66 = await fetch("https://oposiciones-justicia.es/api/temas/temarioVueltasLoad", {
              method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data33)
            });
            if (!response66.ok) {
              throw Error(response66.statusText);
            }
            let json66 = await response66.json();
            let cls66 = await json66;

            let vueltasTemario = cls66

            if (vueltasTemario.length > 0 && vueltasTemario.find(v => v.id_tema == this.props.temaAulaLoad) != undefined) {
              let numVuelta = vueltasTemario.find(v => v.id_tema == this.props.temaAulaLoad).num_vuelta + 1

              let data = { idUser: this.props.idUser, idTema: this.props.temaAulaLoad, numVuelta: numVuelta }

              let response = await fetch("https://oposiciones-justicia.es/api/usuarios/completarVuelta", {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
              });
              if (!response.ok) {
                throw Error(response.statusText);
              }
              let json = await response.json();
              let cls = await json;
              // await swal({
              //   title: 'Vuelta completada',
              //   text: '¡Recargando!',
              //   icon: "success",
              //   closeOnEsc: false,
              //   closeOnClickOutside: false,
              //   timer: 1000,
              // }).then(() => {
              //   window.location.reload()
              // })

              let data234 = { idUser: this.props.idUser }

              let response234 = await fetch("https://oposiciones-justicia.es/api/usuarios/numeroVueltasTemas", {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data234)
              });
              if (!response234.ok) {
                throw Error(response234.statusText);
              }
              let json234 = await response234.json();
              let cls234 = await json234;
              this.setState({ numVueltasTemas23: cls234 })

              swal('Vuelta completada', '', 'success')


            } else {
              let numVuelta = 2

              let data = { idUser: this.props.idUser, idTema: this.props.temaAulaLoad, numVuelta: numVuelta }

              let response = await fetch("https://oposiciones-justicia.es/api/usuarios/completarVuelta1", {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
              });
              if (!response.ok) {
                throw Error(response.statusText);
              }
              let json = await response.json();
              let cls = await json;

              // await swal({
              //   title: 'Vuelta completada',
              //   text: '¡Recargando!',
              //   icon: "success",
              //   closeOnEsc: false,
              //   closeOnClickOutside: false,
              //   timer: 1000,
              // }).then(() => {
              //   window.location.reload()
              // })

              let data234 = { idUser: this.props.idUser }

              let response234 = await fetch("https://oposiciones-justicia.es/api/usuarios/numeroVueltasTemas", {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data234)
              });
              if (!response234.ok) {
                throw Error(response234.statusText);
              }
              let json234 = await response234.json();
              let cls234 = await json234;
              this.setState({ numVueltasTemas23: cls234 })

              swal('Vuelta completada', '', 'success')

            }
          } else {
            swal("¡Vuelta no añadida!", '', "success");
          }
        });



    }
  }
  downloadPdf(e) {
    if (e.target.id.split('-')[0] == 'descargarPdfTestExamen') {
      let diaDelTest = moment(this.state.semanaPrg[0].FechaTestClase).format('YYYY-MM-DD HH:mm')
      let ahoraMismo = moment().format('YYYY-MM-DD HH:mm')
      if (ahoraMismo >= diaDelTest) {
        let locaBloque = e.target.id.split('-')[1];
        let pathFile = this.state.wordTest.find(t => t.id == this.state.semanaPrg[0].bloqueTemas[locaBloque].idWordTestPDF).linkTest
        if (pathFile != undefined) {
          swal('Iniciando descarga, espere.', 'Si en 10 segundos no se inicia vuelva a darle clicl', 'info')
          let url = new URL("https://oposiciones-justicia.es/api/file/downloadFile?route=" + pathFile);
          let nameFile = pathFile.split('/').pop().split('-,-')[0];
          if (nameFile.split('.').length > 2 && nameFile.split('.')[nameFile.split('.').length - 1] != 'pdf') {
            nameFile = nameFile + '.pdf'
          }
          fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            responseType: 'blob'
          }).then(res => {
            if (res.status >= 400) { throw new Error("Bad res from server"); }
            return res.blob();
          }).then(blob => {
            saveAs(blob, nameFile);
          }).catch(function (err) {
            console.log(err)
            alert("Link no valido para descarga, reportelo, gracias.")
          });
        }
      } else {
        swal('Descarga no disponible', 'Este descarga estará disponible a partir del: ' + diaDelTest + '', 'info')
      }
    } else if (e.target.id.split('-')[0] == 'descargarPdfTestRes') {
      let diaDelTest = moment(this.state.semanaPrg[0].FechaTestClase).format('YYYY-MM-DD HH:mm')
      let ahoraMismo = moment().format('YYYY-MM-DD HH:mm')
      if (ahoraMismo >= diaDelTest) {
        let locaBloque = e.target.id.split('-')[1];
        let pathFile = this.state.wordTest.find(t => t.id == this.state.semanaPrg[0].bloqueTemas[locaBloque].idWordTestPDF).linkResolucion
        if (pathFile != undefined) {
          swal('Iniciando descarga, espere.', 'Si en 10 segundos no se inicia vuelva a darle clicl', 'info')
          let url = new URL("https://oposiciones-justicia.es/api/file/downloadFile?route=" + pathFile);
          let nameFile = pathFile.split('/').pop().split('-,-')[0];
          if (nameFile.split('.').length > 2 && nameFile.split('.')[nameFile.split('.').length - 1] != 'pdf') {
            nameFile = nameFile + '.pdf'
          }
          fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            responseType: 'blob'
          }).then(res => {
            if (res.status >= 400) { throw new Error("Bad res from server"); }
            return res.blob();
          }).then(blob => {
            saveAs(blob, nameFile);
          }).catch(function (err) {
            console.log(err)
            alert("Link no valido para descarga, reportelo, gracias.")
          });
        }
      } else {
        swal('Descarga no disponible', 'Este descarga estará disponible a partir del: ' + diaDelTest + '', 'info')
      }
    } else if (e.target.id.split('-')[0] == 'descargarPdfExaGes') {
      let diaDelTest = moment(this.state.semanaPrg[0].FechaTestClase).format('YYYY-MM-DD HH:mm')
      let ahoraMismo = moment().format('YYYY-MM-DD HH:mm')
      if (ahoraMismo >= diaDelTest) {
        let locaBloque = e.target.id.split('-')[1];
        let pathFile = this.state.examGest.find(t => t.id == this.state.semanaPrg[0].bloqueTemas[locaBloque].examenesDesarrollo[this.state.testSelected].idExamenGestion).linkExamen
        if (pathFile != undefined) {
          swal('Iniciando descarga, espere.', 'Si en 10 segundos no se inicia vuelva a darle clicl', 'info')
          let url = new URL("https://oposiciones-justicia.es/api/file/downloadFile?route=" + pathFile);
          let nameFile = pathFile.split('/').pop().split('-,-')[0];
          if (nameFile.split('.').length > 2 && nameFile.split('.')[nameFile.split('.').length - 1] != 'pdf') {
            nameFile = nameFile + '.pdf'
          }
          fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            responseType: 'blob'
          }).then(res => {
            if (res.status >= 400) { throw new Error("Bad res from server"); }
            return res.blob();
          }).then(blob => {
            saveAs(blob, nameFile);
          }).catch(function (err) {
            console.log(err)
            alert("Link no valido para descarga, reportelo, gracias.")
          });
        }
      } else {
        swal('Descarga no disponible', 'Este descarga estará disponible a partir del: ' + diaDelTest + '', 'info')
      }
    } else {
      let locaBloque = e.target.id.split('-')[1];
      let locaTema = e.target.id.split('-')[2];
      let locaApunte = e.target.id.split('-')[3];

      if (this.state.temasFacturados != undefined && this.state.temasFacturados.find(t => t.idTema == this.state.semanaPrg[0].bloqueTemas[locaBloque].temas[locaTema].idTema) != undefined) {
        swal('La descargar se iniciara en breve', '', 'succes')
        let pathFile = this.state.semanaPrg[0].bloqueTemas[locaBloque].temas[locaTema].apuntes[locaApunte].linkPdf
        let url = new URL("https://oposiciones-justicia.es/api/file/downloadFile?route=" + pathFile);
        let nameFile = pathFile.split('/').pop().split('-,-')[0];
        if (nameFile.split('.').length > 2 && nameFile.split('.')[nameFile.split('.').length - 1] != 'pdf') {
          nameFile = nameFile + '.pdf'
        }
        fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          responseType: 'blob'
        }).then(res => {
          if (res.status >= 400) { throw new Error("Bad res from server"); }
          return res.blob();
        }).then(blob => {
          saveAs(blob, nameFile);
        }).catch(function (err) {
          console.log(err)
          alert("Link no valido para descarga, reportelo, gracias.")
        });
      } else {
        swal('Tema no disponible', 'Este tema no ha sido estudiado previamente, solo podrá descargar los temas ya vistos en clase.', 'error')
      }
    }


  }

  async onChangeBuscador(e) {
    if (e.target.id == 'closeBusquedaClases') {
      this.setState({ semanasLoadBuscador: null })
      this.refs.ref_categoria.refs.categoria.value = ''
      this.refs.ref_tema.refs.tema.value = ''
      this.refs.ref_nClase.refs.nClase.value = ''
      this.refs.ref_nombreClase.refs.nombreClase.value = ''
    } else if (e.target.id == 'changeCurso') {
      this.props.loadCurso(null, null, null, null)
      this.props.loadClase(null, true, false)
      this.props.loadTemasFacturados(null)
      this.props.loadAllSemFac(null)
      this.props.loadSemanaPrg(null)
      this.props.loadTemaAula(null)
      this.props.loadSemanasCurso(null)
      window.location.reload()
    } else if (e.target.id == 'closeClaseOpen') {
      this.props.loadSemanaPrg(null)
    } else if (e.target.id == 'categoria') {
      let value = e.target.value
      if (value != undefined && value != '') {
        let seleted = this.state.categoriasJusticia.find(c => c.nombre == value) != undefined ? (this.state.categoriasJusticia.find(c => c.nombre == value).nombre) : (undefined)
        if (seleted != undefined) {
          let semanasLoadBus = this.props.allSemFac.filter(c => c.nombreCategoria == seleted)
          this.setState({ semanasLoadBuscador: semanasLoadBus })
          this.refs.ref_tema.refs.tema.value = ''
          this.refs.ref_nClase.refs.nClase.value = ''
          this.refs.ref_nombreClase.refs.nombreClase.value = ''
        } else {
          this.refs.ref_tema.refs.tema.value = ''
          this.refs.ref_nClase.refs.nClase.value = ''
          this.refs.ref_nombreClase.refs.nombreClase.value = ''
        }

      } else {
        this.refs.ref_tema.refs.tema.value = ''
        this.refs.ref_nClase.refs.nClase.value = ''
        this.refs.ref_nombreClase.refs.nombreClase.value = ''
      }

    } else if (e.target.id == 'tema') {
      let value = e.target.value
      if (value != undefined && value != '') {
        let seleted = this.props.temasFacturados.find(c => c.titulo_tema == value) != undefined ? (this.props.temasFacturados.find(c => c.titulo_tema == value).idTema) : (undefined)
        if (seleted != undefined) {
          let semanasLoadBus = []

          for (let index = 0; index < this.props.allSemFac.length; index++) {
            if (this.props.allSemFac[index].temas.length > 0) {
              for (let as43fd = 0; as43fd < this.props.allSemFac[index].temas.length; as43fd++) {
                if (this.props.allSemFac[index].temas[as43fd].idTema == seleted) {
                  semanasLoadBus.push(this.props.allSemFac[index])
                }

              }
            }

          }
          this.setState({ semanasLoadBuscador: semanasLoadBus })
          this.refs.ref_categoria.refs.categoria.value = ''
          this.refs.ref_nClase.refs.nClase.value = ''
          this.refs.ref_nombreClase.refs.nombreClase.value = ''
        } else {
          this.refs.ref_categoria.refs.categoria.value = ''
          this.refs.ref_nClase.refs.nClase.value = ''
          this.refs.ref_nombreClase.refs.nombreClase.value = ''
        }
      } else {
        this.refs.ref_categoria.refs.categoria.value = ''
        this.refs.ref_nClase.refs.nClase.value = ''
        this.refs.ref_nombreClase.refs.nombreClase.value = ''

      }
    } else if (e.target.id == 'nClase') {
      let value = e.target.value.split('Nº')[1]
      if (value != undefined && value != '') {
        let seleted = value
        if (seleted != undefined) {
          let semanasLoadBus = this.props.allSemFac.filter(c => c.numClase == seleted)
          this.setState({ semanasLoadBuscador: semanasLoadBus })
          this.refs.ref_categoria.refs.categoria.value = ''
          this.refs.ref_tema.refs.tema.value = ''
          this.refs.ref_nombreClase.refs.nombreClase.value = ''
        } else {
          this.refs.ref_categoria.refs.categoria.value = ''
          this.refs.ref_tema.refs.tema.value = ''
          this.refs.ref_nombreClase.refs.nombreClase.value = ''
        }
      } else {
        this.refs.ref_categoria.refs.categoria.value = ''
        this.refs.ref_tema.refs.tema.value = ''
        this.refs.ref_nombreClase.refs.nombreClase.value = ''
      }

    } else if (e.target.id == 'nombreClase') {
      let value = e.target.value

      if (value != undefined && value != '') {
        let seleted = value
        if (seleted != undefined) {
          let semanasLoadBus = this.props.allSemFac.filter(c => c.nombreSemana == seleted)
          this.setState({ semanasLoadBuscador: semanasLoadBus })
          this.refs.ref_categoria.refs.categoria.value = ''
          this.refs.ref_tema.refs.tema.value = ''
          this.refs.ref_nClase.refs.nClase.value = ''
        } else {
          this.refs.ref_categoria.refs.categoria.value = ''
          this.refs.ref_tema.refs.tema.value = ''
          this.refs.ref_nClase.refs.nClase.value = ''
        }
      } else {

        this.refs.ref_categoria.refs.categoria.value = ''
        this.refs.ref_tema.refs.tema.value = ''
        this.refs.ref_nClase.refs.nClase.value = ''
      }
    } else if (e.target.id == 'entrarClase') {
      let urlClase = this.props.semanaPrg[0].linkClaseOnline
      window.open(urlClase, '_blank');
    } else if (e.target.id == 'goZoom') {
      window.open('https://zoom.us/download', '_blank');
    } else if (e.target.id == 'verEjer') {

      let diaDelTest = moment(this.props.semanaPrg[0].FechaTestClase).format('YYYY-MM-DD HH:mm')
      let ahoraMismo = moment().format('YYYY-MM-DD HH:mm')
      if (ahoraMismo >= diaDelTest) {
        let val = !this.state.ejerciciosVer

        $('.backGrodEjerClaseBloq').slideToggle(1000);
        setTimeout(
          function () {
            $('.SSFC-B-TL-bloqueNn2').css("visibility", val == true ? ("unset") : ("hidden"));
            $('.SSFC-B-TL-navEjeerNe').css("visibility", val == true ? ("unset") : ("hidden"));
            $('.SSFC-B-TL-ejerLoad').css("visibility", val == true ? ("unset") : ("hidden"));
          }.bind(this), 1010);
        this.setState({ ejerciciosVer: !val })
      } else {
        let name = "Ejercicios no disponibles";
        let content = document.createElement('div');
        content.innerHTML = `
        Los ejercicios estarán disponibles a partir del</br>
        <b>`+ moment(this.props.semanaPrg[0].FechaTestClase).format('DD-MM-YY HH:mm') + `</b>.`
        content.style.textAlign = "center";

        swal({
          title: name,
          content: content,
          icon: "info"
        })
        //swal('Ejercicios no disponibles','Los ejercicios estarán disponibles a partir del '+diaDelTest+'','info')
      }

    } else if (e.target.id == 'tipoEjerLoadTeorico') {
      this.setState({ tipoEjerSelected: 'testTeorico', testSelected: 0 })

    } else if (e.target.id == 'tipoEjerLoadPractic') {
      this.setState({ tipoEjerSelected: 'testPractico', testSelected: 0 })

    } else if (e.target.id == 'tipoEjerLoadDesarrollo') {
      this.setState({ tipoEjerSelected: 'testDesarrollo', testSelected: 0 })

    } else if (e.target.id == 'descargarPdfExaGes') {
      let diaDelTest = moment(this.props.semanaPrg[0].FechaTestClase).format('YYYY-MM-DD HH:mm')
      let ahoraMismo = moment().format('YYYY-MM-DD HH:mm')
      if (ahoraMismo >= diaDelTest) {
        let locaBloque = this.state.bloqueSelected
        let pathFile = this.state.examGest.find(t => t.id == this.props.semanaPrg[0].bloqueTemas[locaBloque].examenesDesarrollo[this.state.testSelected].idExamenGestion).linkExamen
        if (pathFile != undefined) {
          swal('Iniciando descarga', 'Si en 30 segundos no se inicia vuelva a darle clic', 'info')
          let url = new URL("https://oposiciones-justicia.es/api/file/downloadFile?route=" + pathFile);
          let nameFile = pathFile.split('/').pop().split('-,-')[0];
          if (nameFile.split('.').length > 2 && nameFile.split('.')[nameFile.split('.').length - 1] != 'pdf') {
            nameFile = nameFile + '.pdf'
          }
          fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            responseType: 'blob'
          }).then(res => {
            if (res.status >= 400) { throw new Error("Bad res from server"); }
            return res.blob();
          }).then(blob => {
            saveAs(blob, nameFile);
          }).catch(function (err) {
            console.log(err)
            alert("Link no valido para descarga. Reportelo, gracias.")
          });
        }
      } else {
        swal('Descarga no disponible', 'Este descarga estará disponible a partir del: ' + diaDelTest + '', 'info')
      }
      // } else if(e.target.id == 'descargarPdfExaGes'){
      //   let diaDelTest = moment(this.props.semanaPrg[0].FechaTestClase).format('YYYY-MM-DD HH:mm')
      //   let ahoraMismo = moment().format('YYYY-MM-DD HH:mm')
      //   if(ahoraMismo >= diaDelTest){
      //     let locaBloque = this.state.bloqueSelected
      //     let pathFile = this.state.examGest.find(t => t.id == this.props.semanaPrg[0].bloqueTemas[locaBloque].idExamenGestion).linkExamen
      //     if(pathFile != undefined){
      //       swal('Iniciando descarga','Si en 30 segundos no se inicia vuelva a darle clic','info')
      //       let url = new URL("https://oposiciones-justicia.es/api/file/downloadFile?route="+pathFile);
      //       let nameFile = pathFile.split('/').pop().split('-,-')[0];
      //       fetch(url, {
      //           method: 'GET',
      //           headers: {'Content-Type': 'application/json'},
      //           responseType: 'blob'
      //           }).then(res =>  {
      //               if (res.status >= 400) { throw new Error("Bad res from server");}
      //               return res.blob();
      //           }).then(blob => {
      //             saveAs(blob,nameFile);
      //           }).catch(function(err) {console.log(err)
      //             alert("Link no valido para descarga. Reportelo, gracias.")
      //           });
      //     }
      //   } else {
      //     swal('Descarga no disponible','Este descarga estará disponible a partir del: '+diaDelTest+'','info')
      //   }
      // 
    } else if (e.target.id == 'descargarPdfExaGesSolucion') {
      let diaDelTest = moment(this.props.semanaPrg[0].FechaTestClase).format('YYYY-MM-DD HH:mm')
      let ahoraMismo = moment().format('YYYY-MM-DD HH:mm')
      if (ahoraMismo >= diaDelTest) {
        let locaBloque = this.state.bloqueSelected
        let pathFile = this.state.examGest.find(t => t.id == this.props.semanaPrg[0].bloqueTemas[locaBloque].examenesDesarrollo[this.state.testSelected].idExamenGestion).linkSolucion
        if (pathFile != undefined) {
          swal('Iniciando descarga', 'Si en 30 segundos no se inicia vuelva a darle clic', 'info')
          let url = new URL("https://oposiciones-justicia.es/api/file/downloadFile?route=" + pathFile);
          let nameFile = pathFile.split('/').pop().split('-,-')[0];
          if (nameFile.split('.').length > 2 && nameFile.split('.')[nameFile.split('.').length - 1] != 'pdf') {
            nameFile = nameFile + '.pdf'
          }
          fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            responseType: 'blob'
          }).then(res => {
            if (res.status >= 400) { throw new Error("Bad res from server"); }
            return res.blob();
          }).then(blob => {
            saveAs(blob, nameFile);
          }).catch(function (err) {
            console.log(err)
            alert("Link no valido para descarga. Reportelo, gracias.")
          });
        }
      } else {
        swal('Descarga no disponible', 'Este descarga estará disponible a partir del: ' + diaDelTest + '', 'info')
      }
    } else if (e.target.id == 'descargarPdfExaGesAlumn') {
      let diaDelTest = moment(this.props.semanaPrg[0].FechaTestClase).format('YYYY-MM-DD HH:mm')
      let ahoraMismo = moment().format('YYYY-MM-DD HH:mm')
      if (ahoraMismo >= diaDelTest) {
        let locaBloque = this.state.bloqueSelected
        let pathFile = this.props.semanaPrg[0].bloqueTemas[locaBloque].examenesDesarrollo[this.state.testSelected].linkExaAlumnoDes
        if (pathFile != undefined) {
          swal('Iniciando descarga', 'Si en 30 segundos no se inicia vuelva a darle clic', 'info')
          let url = new URL("https://oposiciones-justicia.es/api/file/downloadFile?route=" + pathFile);
          let nameFile = pathFile.split('/').pop().split('-,-')[0];
          if (nameFile.split('.').length > 2 && nameFile.split('.')[nameFile.split('.').length - 1] != 'pdf') {
            nameFile = nameFile + '.pdf'
          }
          fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            responseType: 'blob'
          }).then(res => {
            if (res.status >= 400) { throw new Error("Bad res from server"); }
            return res.blob();
          }).then(blob => {
            saveAs(blob, nameFile);
          }).catch(function (err) {
            console.log(err)
            alert("Link no valido para descarga. Reportelo, gracias.")
          });
        }
      } else {
        swal('Descarga no disponible', 'Este descarga estará disponible a partir del: ' + diaDelTest + '', 'info')
      }
    } else if (e.target.id == 'realizarTestJus') {
      let diaDelTest = moment(this.props.semanaPrg[0].FechaTestClase).format('YYYY-MM-DD HH:mm')
      let ahoraMismo = moment().format('YYYY-MM-DD HH:mm')
      if (ahoraMismo >= diaDelTest) {
        try {
          let locaBloque = this.state.bloqueSelected

          let locaTest = this.state.testSelected

          let idTest = await this.props.semanaPrg[0].bloqueTemas[locaBloque].testsJusticia[locaTest].idTestJusticia
          let idBloque = await this.props.semanaPrg[0].bloqueTemas[locaBloque].idBloque
          let idClase = await this.props.semanaPrg[0].idClase
          let idPrg = await this.props.semanaPrg[0].idPrg
          // NUEVAS VARIABLES PARA TITULO TEST
          // numBloque --- locaBloque + 1 es el numero del bloque
          let numBloque = parseInt(locaBloque) + 1
          let numTestBloque = parseInt(locaTest) + 1


          let testConPreguntas = await selectPreguntasPorIdTest(idTest, idClase, idPrg, idBloque, numBloque, numTestBloque) // numBloque pasarlo y añadirlo a todas
          let testConRespuestas = await comprobarRespuestas(await testConPreguntas)
          if (this.props.testJusticiaUserLoad.length > 0) {
            //Tiene un test en memoria sin finalizar puede borrarlo o finalizarlo.
            let name = "¡Ojo! - Test sin finalizar";
            let content = document.createElement('div');
            content.innerHTML = `
            Si <b>borras el test, ¡perderás el resultado!</b> y se cargará el nuevo test. <br />
            Si das clic en Ir a finalizar test, visualizarás el test y podrás guardar el resultado.
            `
            content.style.textAlign = "left";

            swal({
              title: name,
              content: content,
              icon: "https://media.giphy.com/media/jn24nXunS0CBWrHtFd/giphy.gif",
              buttons: {
                cancel: "Cargar nuevo Test",
                catch: {
                  text: "Ir a finalizar test",
                  value: "catch",
                },
                defeat: false,
              },
              closeOnEsc: false,
              closeOnClickOutside: false,
            }).then(async (value) => {
              switch (value) {

                case "catch":
                  await this.props.history.push('/hacerTestJusticia');
                  break;

                default:
                  await this.props.borrarTestUser()
                  await this.props.loadTestUser(testConRespuestas)
                  await this.props.history.push('/hacerTestJusticia');
              }
            });
          } else {
            await this.props.loadTestUser(testConRespuestas)
            await this.props.history.push('/hacerTestJusticia');
          }
        } catch (e) { console.log(e) }
      } else {
        swal('Test no disponible', 'Este test se realizará en clase, fecha ' + diaDelTest + '', 'info')
      }
    } else if (e.target.id.split('-')[0] == 'repetirTestJus') {
      let diaDelTest = moment(this.props.semanaPrg[0].FechaTestClase).format('YYYY-MM-DD HH:mm')
      let ahoraMismo = moment().format('YYYY-MM-DD HH:mm')
      if (ahoraMismo >= diaDelTest) {
        try {


          let locaBloque = this.state.bloqueSelected
          let locaTest = this.state.testSelected
          let idTest = await this.props.semanaPrg[0].bloqueTemas[locaBloque].testsJusticia[locaTest].idTestJusticia
          let idBloque = await this.props.semanaPrg[0].bloqueTemas[locaBloque].idBloque
          let idClase = await this.props.semanaPrg[0].idClase
          let idPrg = await this.props.semanaPrg[0].idPrg
          let numBloque = parseInt(locaBloque) + 1
          let numTestBloque = parseInt(locaTest) + 1

          let testConRespuestas = await selectPreguntasPorIdTest(idTest, idClase, idPrg, idBloque, numBloque, numTestBloque)
          let testPregResMezcla = await comprobarRespuestas(await mezclarRespuestasJusticia(testConRespuestas))

          if (this.props.testJusticiaUserLoad.length > 0) {
            //Tiene un test en memoria sin finalizar puede borrarlo o finalizarlo.
            let name = "¡Ojo! - Test sin finalizar";
            let content = document.createElement('div');
            content.innerHTML = `
            Si <b>borras el test, ¡perderás el resultado!</b> y se cargará el nuevo test. <br />
            Si das clic en Ir a finalizar test, visualizarás el test y podrás guardar el resultado.
            `
            content.style.textAlign = "left";

            swal({
              title: name,
              content: content,
              icon: "https://media.giphy.com/media/jn24nXunS0CBWrHtFd/giphy.gif",
              buttons: {
                cancel: "Cargar nuevo Test",
                catch: {
                  text: "Ir a finalizar test",
                  value: "catch",
                },
                defeat: false,
              },
              closeOnEsc: false,
              closeOnClickOutside: false,
            }).then(async (value) => {
              switch (value) {

                case "catch":
                  await this.props.history.push('/hacerTestJusticia');
                  break;

                default:
                  await this.props.borrarTestUser()
                  await this.props.loadTestUser(testPregResMezcla)
                  await this.props.history.push('/hacerTestJusticia');
              }
            });
          } else {
            await this.props.loadTestUser(testPregResMezcla)
            await this.props.history.push('/hacerTestJusticia');
          }
        } catch (e) { console.log(e) }
      } else {

        swal('Test no disponible', 'Este test se realizará en clase, fecha ' + diaDelTest + '', 'info')
      }
    } else if (e.target.id.split('-')[0] == 'realizarCasoPracticoBloque') {
      let diaDelTest = moment(this.props.semanaPrg[0].FechaTestClase).format('YYYY-MM-DD HH:mm')
      let ahoraMismo = moment().format('YYYY-MM-DD HH:mm')
      if (ahoraMismo >= diaDelTest) {

        let locaBloque = this.state.bloqueSelected
        let locaTest = this.state.testSelected
        let idTest = await this.props.semanaPrg[0].bloqueTemas[locaBloque].casosPractico[locaTest].idCasoPractico
        let idBloque = await this.props.semanaPrg[0].bloqueTemas[locaBloque].idBloque
        let idClase = await this.props.semanaPrg[0].idClase
        let idPrg = await this.props.semanaPrg[0].idPrg
        let numBloque = parseInt(locaBloque) + 1
        let numTestBloque = parseInt(locaTest) + 1

        let testConPreguntas = await selectPreguntasPorIdTestCP(idTest, idClase, idPrg, idBloque, numBloque, numTestBloque)
        let testConRespuestas = await comprobarRespuestas(await testConPreguntas)

        if (this.props.casoPracticoUserLoad.length > 0) {
          //Tiene un test en memoria sin finalizar puede borrarlo o finalizarlo.
          let name = "¡Ojo! - Test sin finalizar";
          let content = document.createElement('div');
          content.innerHTML = `
            Si <b>borras el test, ¡perderás el resultado!</b> y se cargará el nuevo test. <br />
            Si das clic en Ir a finalizar test, visualizarás el test y podrás guardar el resultado.
            `
          content.style.textAlign = "left";

          swal({
            title: name,
            content: content,
            icon: "https://media.giphy.com/media/jn24nXunS0CBWrHtFd/giphy.gif",
            buttons: {
              cancel: "Cargar nuevo Test",
              catch: {
                text: "Ir a finalizar test",
                value: "catch",
              },
              defeat: false,
            },
            closeOnEsc: false,
            closeOnClickOutside: false,
          }).then(async (value) => {
            switch (value) {

              case "catch":
                await this.props.history.push('/casoPracticoJusticia');
                break;

              default:
                await this.props.borrarCP()
                await this.props.loadCPUser(testConRespuestas, this.props.semanaPrg[0].bloqueTemas[locaBloque].casosPractico[locaTest].textHtml)
                await this.props.history.push('/casoPracticoJusticia');
            }
          });
        } else {
          await this.props.loadCPUser(testConRespuestas, this.props.semanaPrg[0].bloqueTemas[locaBloque].casosPractico[locaTest].textHtml)
          await this.props.history.push('/casoPracticoJusticia');
        }

      } else {
        swal('Caso Práctico no disponible', 'Este Caso P. se realizará en clase, fecha ' + diaDelTest + '', 'info')
      }
    } else if (e.target.id.split('-')[0] == 'repetirCasoPracticoBloque') {
      let diaDelTest = moment(this.props.semanaPrg[0].FechaTestClase).format('YYYY-MM-DD HH:mm')
      let ahoraMismo = moment().format('YYYY-MM-DD HH:mm')
      if (ahoraMismo >= diaDelTest) {
        let locaBloque = this.state.bloqueSelected
        let locaTest = this.state.testSelected
        let idTest = await this.props.semanaPrg[0].bloqueTemas[locaBloque].casosPractico[locaTest].idCasoPractico
        let idBloque = await this.props.semanaPrg[0].bloqueTemas[locaBloque].idBloque
        let idClase = await this.props.semanaPrg[0].idClase
        let idPrg = await this.props.semanaPrg[0].idPrg
        let numBloque = parseInt(locaBloque) + 1
        let numTestBloque = parseInt(locaTest) + 1

        let testConRespuestas = await selectPreguntasPorIdTestCP(idTest, idClase, idPrg, idBloque, numBloque, numTestBloque)
        let testPregResMezcla = await comprobarRespuestas(await mezclarRespuestasJusticia(testConRespuestas))

        if (this.props.casoPracticoUserLoad.length > 0) {
          //Tiene un test en memoria sin finalizar puede borrarlo o finalizarlo.
          let name = "¡Ojo! - Test sin finalizar";
          let content = document.createElement('div');
          content.innerHTML = `
            Si <b>borras el test, ¡perderás el resultado!</b> y se cargará el nuevo test. <br />
            Si das clic en Ir a finalizar test, visualizarás el test y podrás guardar el resultado.
            `
          content.style.textAlign = "left";

          swal({
            title: name,
            content: content,
            icon: "https://media.giphy.com/media/jn24nXunS0CBWrHtFd/giphy.gif",
            buttons: {
              cancel: "Cargar nuevo Test",
              catch: {
                text: "Ir a finalizar test",
                value: "catch",
              },
              defeat: false,
            },
            closeOnEsc: false,
            closeOnClickOutside: false,
          }).then(async (value) => {
            switch (value) {

              case "catch":
                await this.props.history.push('/casoPracticoJusticia');
                break;

              default:
                await this.props.borrarCP()
                await this.props.loadCPUser(testPregResMezcla, this.props.semanaPrg[0].bloqueTemas[locaBloque].casosPractico[locaTest].textHtml)
                await this.props.history.push('/casoPracticoJusticia');
            }
          });
        } else {
          await this.props.loadCPUser(testPregResMezcla, this.props.semanaPrg[0].bloqueTemas[locaBloque].casosPractico[locaTest].textHtml)
          await this.props.history.push('/casoPracticoJusticia');
        }
      } else {
        swal('Caso Práctico no disponible', 'Este Caso P. se realizará en clase, fecha ' + diaDelTest + '', 'info')
      }
    } else if (e.target.id == 'puntuacionExamenGestion') {
      this.setState({ notaAlumnoAuto: e.target.value })
    } else if (e.target.id.split('-')[0] == 'bloqueGo') {
      let locaBloque = e.target.id.split('-')[1]
      let Tema = null
      let tipoEjer = null
      if (this.props.semanaPrg[0].bloqueTemas[locaBloque].temas.length > 0) {
        Tema = 0
      }
      $('.SSFC-B-TL-bloqueNn2').css("visibility", "hidden");
      $('.SSFC-B-TL-navEjeerNe').css("visibility", "hidden");
      $('.SSFC-B-TL-ejerLoad').css("visibility", "hidden");
      $('.backGrodEjerClaseBloq').css("display", "flex");

      //si testTeorico > 0  testPractico testDesarrollo elegir uno para ver el test directo! y pillar el test 1!
      if (this.props.semanaPrg[0].bloqueTemas[locaBloque].testsJusticia.length > 0) {
        tipoEjer = 'testTeorico'
      } else if (this.props.semanaPrg[0].bloqueTemas[locaBloque].casosPractico.length > 0) {
        tipoEjer = 'testPractico'
      } else if (this.props.semanaPrg[0].bloqueTemas[locaBloque].examenesDesarrollo.length > 0) {
        tipoEjer = 'testDesarrollo'
      }

      this.setState({ bloqueSelected: locaBloque, temaSelected: Tema, ejerciciosVer: false, tipoEjerSelected: tipoEjer, testSelected: 0 })


    } else if (e.target.id.split('-')[0] == 'temaGo') {
      let locaTema = e.target.id.split('-')[1]
      this.setState({ temaSelected: locaTema })
    } else if (e.target.id.split('-')[0] == 'nextVideo') {
      let videoActual = this.state.vidActual
      let nextV = videoActual + 1

      if (nextV > this.props.semanaPrg[0].videosClase.length - 1) {
        nextV = 0
        this.setState({ vidActual: 0 })
        for (let i = 0; i < this.props.semanaPrg[0].videosClase.length; i++) {
          if (i == videoActual) {
            $('#recPlayVidDiv-' + i).css("z-index", "1");

          } else if (i == nextV) {
            $('#recPlayVidDiv-' + i).css("z-index", "" + this.props.semanaPrg[0].videosClase.length);
          } else {
            let indexActual = this.props.semanaPrg[0].videosClase.length - i
            $('#recPlayVidDiv-' + i).css("z-index", "" + indexActual);
          }
        }
      } else {
        this.setState({ vidActual: nextV })
        for (let x = 0; x < this.props.semanaPrg[0].videosClase.length; x++) {
          if (x == videoActual) {
            $('#recPlayVidDiv-' + x).css("z-index", "1");
            // margin-left: 0.2em;
            // margin-top: 0.3em;
          } else if (x == nextV) {
            $('#recPlayVidDiv-' + x).css("z-index", "" + this.props.semanaPrg[0].videosClase.length);

          } else {
            let indexActual = parseInt($('#recPlayVidDiv-' + x).css("z-index")) + 1
            $('#recPlayVidDiv-' + x).css("z-index", "" + indexActual);
          }
        }
      }



    } else if (e.target.id.split('-')[0] == 'ejerToLoad') {
      let value = e.target.id.split('-')[1]
      this.setState({ testSelected: value })
    } else if (e.target.id == 'puntuarMiExamen') {
      let { notaAlumnoAuto, bloqueSelected } = this.state
      let semanaPrg = this.props.semanaPrg

      let textHtmlMensajeExamen = 'Examen auto-evaluado'
      if (textHtmlMensajeExamen != null && textHtmlMensajeExamen != '' && notaAlumnoAuto != null) {

        let data1 = {
          alumnSelectExam: {
            anotaciones: textHtmlMensajeExamen,
            puntuacion: notaAlumnoAuto,
            id_exp: semanaPrg[0].bloqueTemas[bloqueSelected].examenesDesarrollo[this.state.testSelected].idExpExamDesa
          }
        }

        let response1 = await fetch("https://oposiciones-justicia.es/api/preparador/corregirExamGes", {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data1)
        });
        if (!response1.ok) {
          throw Error(response1.statusText);
        }
        let json1 = await response1.json();
        let cls1 = await json1;


        await swal({
          title: 'Examen auto-evaluado',
          text: '¡Recargando web!',
          icon: "success",
          buttons: false,
          closeOnEsc: false,
          closeOnClickOutside: false,
          timer: 2500,
        }).then(() => {
          window.location.reload()
        })



      } else {
        swal('Error falta puntuación', 'Indica la puntuacion con una coma "Ejemplo: 8,25 ó 8,00" no con punto.', 'error')
      }
    }
  }
  async onChangeInput(e) {
    if (e.target.id == "curso") {
      try {
        let objectClase = this.state.cursos.find(c => c.diaSemanal == e.target.value)
        if (objectClase != undefined) {
          if (objectClase.claseActivada != 0) {

            let facturas = []
            let factura2 = []
            let semanasFacturadas = []
            let temasFacturados = []

            let data123 = { idUser: this.props.idUser, idClase: objectClase.idClase }
            let response123 = await fetch("https://oposiciones-justicia.es/api/usuarios/temasActivos", {
              method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data123)
            });
            if (!response123.ok) {
              throw Error(response123.statusText);
            }
            let json123 = await response123.json();
            let cls123 = await json123;
            await this.setState({ userAccesoTemas: cls123[0].activoTemas });

            let data1 = { idClase: objectClase.idClase, idUser: this.props.idUser }
            let response1 = await fetch("https://oposiciones-justicia.es/api/usuarios/facturacionClasePrg", {
              method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data1)
            });
            if (!response1.ok) {
              throw Error(response1.statusText);
            }
            let json1 = await response1.json();
            let cls1 = await json1;
            for (var i = 0; i < cls1.length; i++) {
              facturas.push({
                idFactura: cls1[i].idFactura,
                fechaPago: cls1[i].fechaPago,
                fechaCaducidad: cls1[i].fechaCaducidad,
                tipo: cls1[i].tipo
              })
              factura2.push({
                idFactura: cls1[i].idFactura,
                fechaPago: cls1[i].fechaPago,
                fechaCaducidad: cls1[i].fechaCaducidad,
                tipo: cls1[i].tipo
              })
            }

            if (facturas[facturas.length - 1].tipo == 10 || facturas[facturas.length - 1].tipo == 20) {

              await this.props.loadCurso(objectClase.idClase, objectClase.diaSemanal, objectClase.id_oposicion, 0)
              await this.props.loadClase(null, false, true)

              swal({
                title: 'Cargando curso',
                text: 'En breve podrá visualizar todo el contenido del curso.',
                icon: "https://media.giphy.com/media/feN0YJbVs0fwA/giphy.gif",
                buttons: false,
                closeOnEsc: false,
                closeOnClickOutside: false,
              })

              let data1x23 = {
                idUser: this.props.idUser,
                idClase: this.props.idClase
              }
              let response1x23 = await fetch("https://oposiciones-justicia.es/api/usuarios/infoCursoTiming", {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data1x23)
              });
              if (!response1x23.ok) {
                throw Error(response1x23.statusText);
              }
              let json1x23 = await response1x23.json();
              let cls1x23 = await json1x23;

              if (cls1x23.length > 0) {
                window.location.reload()
              }
            } else {

              let finFactura = facturas.length - 1

              let fechaC = moment(facturas[finFactura].fechaCaducidad).format('YYYY-MM-DD HH:mm')
              let data2 = { idClase: objectClase.idClase, idUser: this.props.idUser, fechaPago: moment(facturas[finFactura].fechaPago).subtract(7, 'days').format('YYYY-MM-DD HH:mm'), fechaCaducidad: fechaC }

              let urlSemClasefAC = "https://oposiciones-justicia.es/api/usuarios/semanasDeClaseFacturadas"
              if (facturas[finFactura].tipo == 3) {
                urlSemClasefAC = "https://oposiciones-justicia.es/api/usuarios/semanasDeClaseFacturadasCursoAuto"
              } else {
                urlSemClasefAC = "https://oposiciones-justicia.es/api/usuarios/semanasDeClaseFacturadas"
              }

              let response2 = await fetch(urlSemClasefAC, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data2)
              });
              if (!response2.ok) {
                throw Error(response2.statusText);
              }
              let json2 = await response2.json();
              let cls2New = await json2;
              let cls2 = []

              for (let kkt = 0; kkt < cls2New.length; kkt++) {
                let fechaMostra = moment(cls2New[kkt].fechaDesbloqueo).format('YYYY-MM-DD HH:mm')
                let ahora = moment().format('YYYY-MM-DD HH:mm')
                if (ahora >= fechaMostra) {
                  cls2.push(cls2New[kkt])
                }
              }

              if (cls2.length > 1) {
                cls2 = cls2.slice(cls2.length - 2)
              } else {
                if (facturas.length > 1) {
                  let finFactura2 = facturas.length - 2

                  let fechaC2 = moment(facturas[finFactura2].fechaCaducidad).format('YYYY-MM-DD HH:mm')
                  let data23los = { idClase: objectClase.idClase, idUser: this.props.idUser, fechaPago: moment(facturas[finFactura2].fechaPago).subtract(7, 'days').format('YYYY-MM-DD HH:mm'), fechaCaducidad: fechaC2 }

                  let urlSemClasefAC = "https://oposiciones-justicia.es/api/usuarios/semanasDeClaseFacturadas"
                  if (facturas[finFactura2].tipo == 3) {
                    urlSemClasefAC = "https://oposiciones-justicia.es/api/usuarios/semanasDeClaseFacturadasCursoAuto"
                  } else {
                    urlSemClasefAC = "https://oposiciones-justicia.es/api/usuarios/semanasDeClaseFacturadas"
                  }
                  let response23los = await fetch(urlSemClasefAC, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data23los)
                  });
                  if (!response23los.ok) {
                    throw Error(response23los.statusText);
                  }
                  let json23los = await response23los.json();
                  let cls23losNew = await json23los;

                  if (cls23losNew.length > 1) {
                    cls23losNew = cls23losNew.slice(cls23losNew.length - 2)
                  }
                  for (let kkt23 = 0; kkt23 < cls23losNew.length; kkt23++) {
                    let fechaMostra2 = moment(cls23losNew[kkt23].fechaDesbloqueo).format('YYYY-MM-DD HH:mm')
                    let ahora2 = moment().format('YYYY-MM-DD HH:mm')
                    if (ahora2 >= fechaMostra2 && cls2.findIndex(p => p.idPrg == cls23losNew[kkt23].idPrg && moment(p.fechaClase).format('YYYY-MM-DD HH:mm') == moment(cls23losNew[kkt23].fechaClase).format('YYYY-MM-DD HH:mm')) == -1 && cls2.length < 2) {
                      cls2.push(cls23losNew[kkt23])

                    }
                  }

                  // if (cls2.length == 1) {
                  //   console.log("solo una clase")
                  // }

                } else {
                  //Solo tenemos una clase desbloqueada
                  let finFactura2 = facturas.length - 1

                  let fechaC2 = moment(facturas[finFactura2].fechaCaducidad).format('YYYY-MM-DD HH:mm')
                  let data23los = { idClase: objectClase.idClase, idUser: this.state.idUser, fechaPago: moment(facturas[finFactura2].fechaPago).subtract(7, 'days').format('YYYY-MM-DD HH:mm'), fechaCaducidad: fechaC2 }

                  let urlSemClasefAC = "https://oposiciones-justicia.es/api/usuarios/semanasDeClaseFacturadas"
                  if (facturas[finFactura2].tipo == 3) {
                    urlSemClasefAC = "https://oposiciones-justicia.es/api/usuarios/semanasDeClaseFacturadasCursoAuto"
                  } else {
                    urlSemClasefAC = "https://oposiciones-justicia.es/api/usuarios/semanasDeClaseFacturadas"
                  }

                  let response23los = await fetch(urlSemClasefAC, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data23los)
                  });
                  if (!response23los.ok) {
                    throw Error(response23los.statusText);
                  }
                  let json23los = await response23los.json();
                  let cls23losNew = await json23los;

                  if (cls23losNew.length > 1) {
                    cls23losNew = cls23losNew.slice(cls23losNew.length - 2)
                  }
                  for (let kkt23 = 0; kkt23 < cls23losNew.length; kkt23++) {
                    let fechaMostra2 = moment(cls23losNew[kkt23].fechaDesbloqueo).format('YYYY-MM-DD HH:mm')
                    let ahora2 = moment().format('YYYY-MM-DD HH:mm')
                    if (ahora2 >= fechaMostra2 && cls2.findIndex(p => p.idPrg == cls23losNew[kkt23].idPrg && moment(p.fechaClase).format('YYYY-MM-DD HH:mm') == moment(cls23losNew[kkt23].fechaClase).format('YYYY-MM-DD HH:mm')) == -1 && cls2.length < 2) {
                      cls2.push(cls23losNew[kkt23])

                    }
                  }

                }

              }
              cls2 = cls2.sort((a, b) => new Date(a.fechaClase) - new Date(b.fechaClase))

              for (var f = 0; f < cls2.length; f++) {
                let fechaMostra = moment(cls2[f].fechaDesbloqueo).format('YYYY-MM-DD HH:mm')
                let ahora = moment().format('YYYY-MM-DD HH:mm')
                if (ahora >= fechaMostra) {
                  // comprobar que no esta duplicada la semana
                  let idPrgComprobacion = cls2[f].idPrg;
                  let existeIdPrg = semanasFacturadas.findIndex(s => s.idPrg == idPrgComprobacion && moment(s.fechaClase).format('YYYY-MM-DD HH:mm') == moment(cls2[f].fechaClase).format('YYYY-MM-DD HH:mm'));
                  if (existeIdPrg == -1) {
                    semanasFacturadas.push(cls2[f])
                  }
                }

              }

              for (var i = 0; i < semanasFacturadas.length; i++) {
                semanasFacturadas[i].temas = []
              }
              for (var k = 0; k < semanasFacturadas.length; k++) {
                let data3 = { idPrg: semanasFacturadas[k].idPrg }


                let response3 = await fetch("https://oposiciones-justicia.es/api/preparador/temasSemanalesPRG", {
                  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data3)
                });
                if (!response3.ok) {
                  throw Error(response3.statusText);
                }
                let json3 = await response3.json();
                let cls3 = await json3;

                for (var z = 0; z < cls3.length; z++) {
                  let locaBloque = semanasFacturadas.map((elm, idx) => elm.idPrg == cls3[z].idPrg && elm.numClase == semanasFacturadas[k].numClase ? idx : '').filter(String)

                  if (locaBloque.length > 0) {
                    for (let rtx = 0; rtx < locaBloque.length; rtx++) {

                      let val = locaBloque[rtx]
                      if (semanasFacturadas[val].temas.findIndex(t => t.idTema == cls3[z].idTema) == -1) {
                        semanasFacturadas[val].temas.push({
                          idTema: cls3[z].idTema,
                          tituloTema: cls3[z].tituloTema,
                          nombreTema: cls3[z].nombreTema
                        })
                      }

                    }
                  }
                  // let locaBloque = await semanasFacturadas.findIndex(c => c.idPrg == cls3[z].idPrg && c.numClase == semanasFacturadas[k].numClase);
                  // if (locaBloque != -1) {
                  //   semanasFacturadas[locaBloque].temas.push({
                  //     idTema: cls3[z].idTema,
                  //     tituloTema: cls3[z].tituloTema
                  //   })
                  // }
                }
              }

              await this.props.loadCurso(objectClase.idClase, objectClase.diaSemanal, objectClase.id_oposicion, this.state.userAccesoTemas)
              await this.props.loadClase(semanasFacturadas, false, true)



              // Todas las facturas

              let semanasFacturadasCompleto = []
              for (var ui = 0; ui < factura2.length; ui++) {
                let fechaCxz = moment(factura2[ui].fechaCaducidad).format('YYYY-MM-DD HH:mm')

                let data2xz = { idClase: objectClase.idClase, idUser: this.props.idUser, fechaPago: factura2[ui].fechaPago, fechaCaducidad: fechaCxz }

                // Poner fecha caducidad --> mes siguientes día 7
                // clasificar semanas comprobar que no existe
                let urlSemClasefAC23 = "https://oposiciones-justicia.es/api/usuarios/semanasDeClaseFacturadas"
                if (factura2[ui].tipo == 3) {
                  urlSemClasefAC = "https://oposiciones-justicia.es/api/usuarios/semanasDeClaseFacturadasCursoAuto"
                } else {
                  urlSemClasefAC = "https://oposiciones-justicia.es/api/usuarios/semanasDeClaseFacturadas"
                }
                let response2xz = await fetch(urlSemClasefAC23, {
                  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data2xz)
                });
                if (!response2xz.ok) {
                  throw Error(response2xz.statusText);
                }
                let json2xz = await response2xz.json();
                let cls2xz = await json2xz;

                for (var fxs = 0; fxs < cls2xz.length; fxs++) {
                  let fechaMostra = moment(cls2xz[fxs].fechaDesbloqueo).format('YYYY-MM-DD HH:mm')
                  let ahora = moment().format('YYYY-MM-DD HH:mm')
                  if (ahora >= fechaMostra) {
                    // comprobar que no existe en cls2xz la semana
                    let idPrgComprobacion = cls2xz[fxs].idPrg;
                    let existeIdPrg = semanasFacturadasCompleto.findIndex(s => s.idPrg == idPrgComprobacion);
                    if (existeIdPrg == -1) {
                      semanasFacturadasCompleto.push(cls2xz[fxs])
                    }
                  }

                }
              }

              for (var ix = 0; ix < semanasFacturadasCompleto.length; ix++) {
                semanasFacturadasCompleto[ix].temas = []
              }
              for (var kd = 0; kd < semanasFacturadasCompleto.length; kd++) {
                let data3 = { idPrg: semanasFacturadasCompleto[kd].idPrg }


                let response3 = await fetch("https://oposiciones-justicia.es/api/preparador/temasSemanalesPRG", {
                  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data3)
                });
                if (!response3.ok) {
                  throw Error(response3.statusText);
                }
                let json3 = await response3.json();
                let cls3 = await json3;

                for (var zf = 0; zf < cls3.length; zf++) {

                  let locaBloque2 = semanasFacturadasCompleto.map((elm, idx) => elm.idPrg == cls3[zf].idPrg && elm.numClase == semanasFacturadasCompleto[kd].numClase ? idx : '').filter(String)

                  if (locaBloque2.length > 0) {
                    for (let rtx2 = 0; rtx2 < locaBloque2.length; rtx2++) {

                      let val2 = locaBloque2[rtx2]
                      if (semanasFacturadasCompleto[val2].temas.findIndex(t => t.idTema == cls3[zf].idTema) == -1) {
                        semanasFacturadasCompleto[val2].temas.push({
                          idTema: cls3[zf].idTema,
                          tituloTema: cls3[zf].tituloTema,
                          nombreTema: cls3[z].nombreTema
                        })
                      }

                    }
                  }


                  // let locaBloque = await semanasFacturadasCompleto.findIndex(c => c.idPrg == cls3[zf].idPrg && c.numClase == semanasFacturadasCompleto[kd].numClase);
                  // if (locaBloque != -1) {
                  //   semanasFacturadasCompleto[locaBloque].temas.push({
                  //     idTema: cls3[zf].idTema,
                  //     tituloTema: cls3[zf].tituloTema
                  //   })
                  // }
                }
              }


              // meter redux todas semanas
              await this.props.loadAllSemFac(semanasFacturadasCompleto)

            }
            // calcular todas las emanas
            //await this.setState({ semanasFacturadas: semanasFacturadas, displayClases: false, displaySemanas: true })
            // redux


          } else {
            swal('¡Acceso Denegado!', 'No tiene activado el acceso a este curso.', 'error')
          }
        } else {

          this.props.loadCurso(null, null, null, null)
          this.props.loadClase(null, true, false)
          this.props.loadTemasFacturados(null)
          this.props.loadAllSemFac(null)

        }
      } catch (e) { console.log(e) }
    }
  }

  async onClickTem(e) {

    if (e.target.id == 'recomendacionEstudio') {
      this.setState({ modoTemasEstudio: 'recomendacion', temasBusqueda: null, listadoTemasOn: null })
    } else if (e.target.id == 'miRitmo') {
      this.setState({ modoTemasEstudio: 'miRitmo', temasBusqueda: null, listadoTemasOn: null })
    } else if (e.target.id == 'verTodosTemas') {
      this.setState({ temasBusqueda: this.props.temasFacturados, listadoTemasOn: true })
    } else if (e.target.id == 'resetBusqueda') {
      this.setState({ temasBusqueda: null, listadoTemasOn: null })
    } else if (e.target.id == 'selectedNormal') {
      let { idOposicion } = this.props
      // SACAR DEL BD EL ESTADO SI ESTA YA COMPLETADO O NO
      let tipoEstudio = {
        tipo: 'normal',
        mensual: idOposicion != 8 && idOposicion != 9 ? [6, 12] : [6, 10],
        estado: null,
        tipoMensualidad: null,
        fechaInicio: null
      }
      this.setState({ modoRecomendacionEstudio: tipoEstudio })

    } else if (e.target.id == 'selectedRepaso') {
      let { idOposicion } = this.props
      let tipoEstudio = {
        tipo: 'repaso',
        mensual: idOposicion != 8 && idOposicion != 9 ? [3, 6, 12] : [3, 6, 10],
        estado: null,
        tipoMensualidad: null,
        fechaInicio: null
      }
      this.setState({ modoRecomendacionEstudio: tipoEstudio })
    } else if (e.target.id == 'selectedIntensivo') {

      let tipoEstudio = {
        tipo: 'intensivo',
        mensual: [1, 3],
        estado: null,
        tipoMensualidad: null,
        fechaInicio: null
      }
      this.setState({ modoRecomendacionEstudio: tipoEstudio })
    } else if (e.target.id.split('-')[0] == 'mensual') {
      let tipoMensualidad = e.target.id.split('-')[1]

      // guardar la mensuialidad y pedir fecha 

      let tipoEstudio = this.state.modoRecomendacionEstudio



      tipoEstudio.tipoMensualidad = tipoMensualidad

      this.setState({ modoRecomendacionEstudio: tipoEstudio })

    } else if (e.target.id == 'fechaInicioCurso') {
      let fechaInicio = e.target.value
      let tipoEstudio = this.state.modoRecomendacionEstudio

      tipoEstudio.fechaInicio = fechaInicio

      this.setState({ modoRecomendacionEstudio: tipoEstudio })

    } else if (e.target.id == 'generarRecomendacion') {
      let { idClase, idOposicion } = this.props
      let tipoEstudio = this.state.modoRecomendacionEstudio
      let idCursoBase

      swal({
        title: 'Generando plan de estudio',
        text: 'En breve tendrá disponible el plan de estudio',
        icon: "https://media.giphy.com/media/feN0YJbVs0fwA/giphy.gif",
        buttons: false,
        closeOnEsc: false,
        closeOnClickOutside: false,
      })
      // Guardar en BD la info! --> programacionCursos ver si existe sino insert
      let data1 = {
        idUser: this.props.idUser,
        idClase: this.props.idClase
      }
      let response1 = await fetch("https://oposiciones-justicia.es/api/usuarios/infoCursoTiming", {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data1)
      });
      if (!response1.ok) {
        throw Error(response1.statusText);
      }
      let json1 = await response1.json();
      let cls1 = await json1;

      let urlFetch2 = 'https://oposiciones-justicia.es/api/usuarios/updateCursoTiming'
      let data2 = {
        tipoEstudio: tipoEstudio,
        idUser: this.props.idUser,
        fechaInicio: moment(tipoEstudio.fechaInicio).format('YYYY-MM-DD 00:01'),
        id: null,
        idClase: this.props.idClase
      }
      if (cls1.length > 0) {
        urlFetch2 = 'https://oposiciones-justicia.es/api/usuarios/updateCursoTiming'
        data2.id = cls1[0].id
      } else {
        urlFetch2 = 'https://oposiciones-justicia.es/api/usuarios/insertCursoTiming'
      }



      let response2 = await fetch(urlFetch2, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data2)
      });
      if (!response2.ok) {
        throw Error(response2.statusText);
      }
      let json2 = await response2.json();
      let cls2 = await json2;

      if (idOposicion == 4) {
        // idCursoBase = 'tramitacion'
        idCursoBase = 17
      } else if (idOposicion == 3) {
        // idCursoBase = 'gestion'
        idCursoBase = 18
      } else if (idOposicion == 8) {
        // idCursoBase = 'gestion pi'
        idCursoBase = 19
      } else if (idOposicion == 9) {
        // idCursoBase = 'tra pi'
        idCursoBase = 26
      }

      let semanasPrgCurso = await crearSemanasPrgCurso(idClase, idCursoBase, tipoEstudio)
      // subimos con props a redux semanasPrgCurso

      this.props.loadSemanasCurso(semanasPrgCurso)
      console.log('semanasPrgCurso')
      console.log(semanasPrgCurso)
      tipoEstudio.estado = true
      this.setState({ modoRecomendacionEstudio: tipoEstudio })
      swal.close()


    } else if (e.target.id == 'cambiarRecomendacion') {


      swal({
        title: "¿Estas segur@?",
        text: "Si le das a ok, podrá cambiar el plan de estudio y volver a configurarlo.",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
        .then(async (willDelete) => {
          if (willDelete) {
            this.setState({ modoRecomendacionEstudio: null })

          } else {
            swal('Proceso cancelado', 'El plan de estudio no ha sido alterada', 'success')
          }
        });


    }






  }

  async onChangeBuscadorTemas(e) {

    if (e.target.id == 'categoria') {
      let value = e.target.value
      let categoriasJusticia = this.state.categoriasJusticia
      let temasFacturados = this.props.temasFacturados



      let categoriaSelected = categoriasJusticia.find(a => a.nombre == value)
      if (categoriaSelected != undefined) {
        let filtroTemas = temasFacturados.filter(t => t.categoria == categoriaSelected.id_categoria)



        if (filtroTemas.length > 0) {
          this.setState({ temasBusqueda: filtroTemas, listadoTemasOn: null })
        } else {
          swal('Ningun tema encontrado', 'No disponemos de ningun tema asociado a esta categoría')
        }
      } else {
        this.setState({ temasBusqueda: null, listadoTemasOn: null })
      }

      // console.log('value')
      // console.log(value)
      // console.log('categoriasJusticia')
      // console.log(categoriasJusticia)
    } else if (e.target.id == 'tema') {
      let value = e.target.value
      let temasFacturados = this.props.temasFacturados

      let temaSelected = temasFacturados.find(t => t.titulo_tema == value)

      if (temaSelected != undefined) {
        let filtroTemas = []
        filtroTemas.push(temaSelected)
        this.setState({ temasBusqueda: filtroTemas, listadoTemasOn: null })
      } else {
        this.setState({ temasBusqueda: null, listadoTemasOn: null })
      }
      // console.log('value')
      // console.log(value)
      // console.log('temasFacturados')
      // console.log(temasFacturados)
    }
  }

  async componentDidMount() {
    let data1x23 = {
      idUser: this.props.idUser,
      idClase: this.props.idClase
    }
    let response1x23 = await fetch("https://oposiciones-justicia.es/api/usuarios/infoCursoTiming", {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data1x23)
    });
    if (!response1x23.ok) {
      throw Error(response1x23.statusText);
    }
    let json1x23 = await response1x23.json();
    let cls1x23 = await json1x23;

    if (cls1x23.length > 0) {
      let tipoEstudio = {
        tipo: cls1x23[0].tipo,
        mensual: null,
        estado: true,
        tipoMensualidad: cls1x23[0].temporalizacion,
        fechaInicio: cls1x23[0].fechaInicio
      }
      this.setState({ modoRecomendacionEstudio: tipoEstudio })

      if (this.props.semanasPrgCurso == null) {
        swal({
          title: 'Generando plan de estudio',
          text: 'En breve tendrá disponible el plan de estudio',
          icon: "https://media.giphy.com/media/feN0YJbVs0fwA/giphy.gif",
          buttons: false,
          closeOnEsc: false,
          closeOnClickOutside: false,
        })

        let { idClase, idOposicion } = this.props
        let idCursoBase

        if (idOposicion == 4) {
          // idCursoBase = 'tramitacion'
          idCursoBase = 17
        } else if (idOposicion == 3) {
          // idCursoBase = 'gestion'
          idCursoBase = 18
        } else if (idOposicion == 8) {
          // idCursoBase = 'gestion pi'
          idCursoBase = 19
        } else if (idOposicion == 9) {
          // idCursoBase = 'tra pi'
          idCursoBase = 26
        }

        let semanasPrgCurso = await crearSemanasPrgCurso(idClase, idCursoBase, tipoEstudio)
        this.props.loadSemanasCurso(semanasPrgCurso)
        swal.close()

      }
    }
    let data234 = { idUser: this.props.idUser }

    let response234 = await fetch("https://oposiciones-justicia.es/api/usuarios/numeroVueltasTemas", {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data234)
    });
    if (!response234.ok) {
      throw Error(response234.statusText);
    }
    let json234 = await response234.json();
    let cls234 = await json234;
    this.setState({ numVueltasTemas23: cls234 })

    let data2 = { idUser: this.props.idUser }
    fetch("https://oposiciones-justicia.es/api/usuarios/clasesAlumno", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data2)
    }).then(response => {
      if (response.status >= 400) { throw new Error("Bad response from server"); }
      return response.json();
    }).then(data => {
      if (data.length > 0) {
        this.setState({ cursos: data })
      } else {
        this.setState({ displayNoClases: 'flex' })
        if (this.props.idUser != undefined) {
          swal('No se encuentra inscrito en ningun curso', '', 'info')
        }

      }

    }).catch(function (err) { });

    fetch('https://oposiciones-justicia.es/api/preparador/wordTest')
      .then(res => res.json())
      .then(er => this.setState({
        wordTest: er
      }))
      .catch(error => console.log('Object fecth failed', error));
    fetch('https://oposiciones-justicia.es/api/preparador/examGest')
      .then(res => res.json())
      .then(er => this.setState({
        examGest: er
      }))
      .catch(error => console.log('Object fecth failed', error));
    fetch('https://oposiciones-justicia.es/api/usuarios/consultaCategorias')
      .then(res => res.json())
      .then(cls => this.setState({
        categoriasJusticia: cls
      }))
    let response1 = await fetch("https://oposiciones-justicia.es/api/leyes/consulta");
    if (!response1.ok) {
      throw Error(response1.statusText);
    }
    let json1 = await response1.json();
    let cls1 = await json1;
    await this.setState({ busquedaLeyes: cls1 });
    if (isDefined(this.props.semanaPrg) && this.props.semanaPrg[0].bloqueTemas.length > 0 && this.state.busquedaLeyes != undefined) {
      //console.log('entro renuevo clase')
      let tipoEjer = null
      if (this.props.semanaPrg[0].bloqueTemas[this.state.bloqueSelected].testsJusticia.length > 0) {
        tipoEjer = 'testTeorico'
      } else if (this.props.semanaPrg[0].bloqueTemas[this.state.bloqueSelected].casosPractico.length > 0) {
        tipoEjer = 'testPractico'
      } else if (this.props.semanaPrg[0].bloqueTemas[this.state.bloqueSelected].idExamenGestion > 1) {
        tipoEjer = 'testDesarrollo'
      }

      this.setState({ tipoEjerSelected: tipoEjer, testSelected: 0 })
      if (isDefined(this.props.temasFacturados) && this.props.temasFacturados.length > 0) {
        let claseLoad = await loadClaseCurso(this.props.semPrgLoadFactura, this.props.idUser, this.state.busquedaLeyes)



        if (isDefined(claseLoad)) {
          //FILTRAR CLASE!
          // let data123 = { idUser: this.props.idUser, idClase: this.props.idClase}
          // let response123 = await fetch("https://oposiciones-justicia.es/api/usuarios/sincroActivada", {
          //   method: 'POST',headers: {'Content-Type': 'application/json'},body: JSON.stringify(data123)});
          //   if (!response123.ok) {
          //     throw Error(response123.statusText);
          //   }
          // let json123 = await response123.json();
          // let cls123 = await json123;

          // if(cls123 != undefined && cls123.length > 0 && cls123[0].sincronizacion != null) {
          //   let sincronizar = {
          //     idUser: this.props.idUser,
          //     idClase: this.props.idClase,
          //     idClaseSincro: cls123[0].idClaseSincro
          //   }

          //   let filtroClase = await filtrarClaseCurso(claseLoad, this.props.tipoUser, this.props.userAccesoTemas, this.props.temasFacturados, sincronizar)
          //   await this.props.loadSemanaPrg(filtroClase)
          //   swal.close()

          // } else {

          let filtroClase = await filtrarClaseCurso(claseLoad, this.props.tipoUser, this.props.userAccesoTemas, this.props.temasFacturados)
          await this.props.loadSemanaPrg(filtroClase)
          //swal.close()

          // }



        }
      }


    }
    //swal.close()        
  }

  render() {
    const { isLogged, semanasFacturadas, nombreUser, tipoUser, fotoPerfil, semanaPrg, idClase, nombreClase, allSemFac, temasFacturados, semPrgLoadFactura, escritorioTema, temaAulaLoad, semanasPrgCurso } = this.props;
    const { cursos, categoriasJusticia, semanasLoadBuscador, bloqueSelected, ejerciciosVer, temaSelected, testSelected, tipoEjerSelected, categoriaSeletedB, temaSeletedB, semanaSelBusNum, semanaSelBusName, displaySemanas, toggleClase, displayClases, displayNoClases, wordTest, examGest, valueCursoBusqueda, modoTemasEstudio, temasBusqueda, listadoTemasOn, modoRecomendacionEstudio, numVueltasTemas23 } = this.state
    const nivelRequired = 1;

    if (isLogged && (nivelRequired == tipoUser || tipoUser >= 1)) {
      return (
        <div className="bodyContenido">


          {!isDefined(idClase) ? (
            <div className="aVA-SelCurso">
              <div className="aVA-SC-title">
                Elija un Curso
              </div>
              <div className="aVA-SC-buscarCurso">
                <Input2 type="text" id="curso" name="curso" placeholder="Curso" icon="fas fa-search" datalist="cursosAlumno" ref="ref_curso" onChange={this.onChangeInput} />
                <datalist id="cursosAlumno">
                  {cursos && cursos.map((cls, key1) =>
                    <option key={key1} value={cls.diaSemanal}></option>
                  )}
                </datalist>
              </div>
              <div className="aVA-SC-img" style={{ width: '100%' }}>
                <img src="../img/backGCursoAula.jpg" />
              </div>
            </div>
          ) : null}


          {isDefined(idClase) && isDefined(semanasFacturadas) && !isDefined(semanaPrg) ? (
            <div className="aVA-SelCurso2">

              <div className="aVA-S-changeCurso">
                <div className="aVA-S-changeCursoTtile">
                  {nombreClase}
                </div>
                <div style={{ width: '140px', marginTop: '10px' }}>
                  <Boton id="changeCurso" icon1="" icon2="" texto="Cambiar Curso" onClick={this.onChangeBuscador} />
                </div>
              </div>
              <div className="aVA-SC-busquedaSem">
                <div className="aVA-SC-title">
                  Elija una Clase
                </div>
                <div className="aVA-SC-topSemanasBox">
                  {semanasFacturadas && semanasFacturadas.map((cls, key2) =>
                    <CajaInfoClase semanaFacturada={cls} keyProp={key2} actuales={true} />
                  )}
                </div>
              </div>
              <div className="aVA-SC-semanasBusqeda">

                {isDefined(allSemFac) ? (
                  <div className="SBOX-busqueda-content">

                    <div className="SBOX-BC-top">

                      <div style={{ maxWidth: '200px', marginRight: '5px', marginTop: '5px' }}>
                        <Input2 type="text" id="categoria" name="categoria" placeholder="Categoria" icon="fas fa-search" datalist="categoriass" ref="ref_categoria" onChange={this.onChangeBuscador} />
                        <datalist id="categoriass">
                          {categoriasJusticia && categoriasJusticia.map((cls, key3) =>
                            <option key={key3} value={cls.nombre}></option>
                          )}
                        </datalist>
                      </div>
                      <div style={{ maxWidth: '200px', marginRight: '5px', marginTop: '5px' }}>
                        <Input2 type="text" id="tema" name="tema" placeholder="Tema" icon="fas fa-search" datalist="temass" ref="ref_tema" onChange={this.onChangeBuscador} />
                        <datalist id="temass">
                          {temasFacturados && temasFacturados.map((cls, key4) =>
                            <option key={key4} value={cls.titulo_tema}>{cls.titulo_tema + ' (' + cls.nombre_tema + ')'}</option>
                          )}
                        </datalist>
                      </div>
                      <div style={{ maxWidth: '200px', marginRight: '5px', marginTop: '5px' }}>
                        <Input2 type="text" id="nClase" name="nClase" placeholder="Nº Clase" icon="fas fa-search" datalist="numClaseSel" ref="ref_nClase" onChange={this.onChangeBuscador} />
                        <datalist id="numClaseSel">
                          {allSemFac && allSemFac.filter(
                            (ele, pos) => allSemFac.findIndex(a => a.numClase == ele.numClase) != -1 && allSemFac.findIndex(a => a.numClase == ele.numClase) == pos
                          ).map((cls, key5) =>
                            <option key={key5} value={'Clase Nº ' + cls.numClase}></option>
                          )}
                        </datalist>
                      </div>
                      <div style={{ maxWidth: '200px', marginRight: '5px', marginTop: '5px' }}>
                        <Input2 type="text" id="nombreClase" name="nombreClase" placeholder="Nombre Clase" icon="fas fa-search" datalist="nombreClasess" ref="ref_nombreClase" onChange={this.onChangeBuscador} />
                        <datalist id="nombreClasess">
                          {allSemFac && allSemFac.filter(x => x.nombreSemana != null).length > 0 && allSemFac.filter(
                            (ele, pos) => allSemFac.findIndex(a => a.numClase == ele.numClase) != -1 && allSemFac.findIndex(a => a.numClase == ele.numClase) == pos
                              && ele.nombreSemana != null
                          ).map((cls, key6) =>
                            <option key={key6} value={cls.nombreSemana}></option>
                          )}
                        </datalist>
                      </div>
                      {isDefined(semanasLoadBuscador) && semanasLoadBuscador.length > 0 ? (
                        <div className="closebISClaseBADFK2">
                          <i className="far fa-times-circle" id="closeBusquedaClases" onClick={this.onChangeBuscador}></i>
                        </div>
                      ) : null

                      }

                    </div>
                  </div>
                ) : (
                  <div className="SBOX-BC-top">
                    <div style={{ marginLeft: '0px', color: '#3469b7', fontWeight: 'bold' }}> CARGANDO BUSCADOR DE CLASES </div>
                    <Ellipsis color="#3469b7" size={72} style={{ margin: '0px 82px 0px 82px' }} />
                  </div>
                )}



                {!isDefined(semanasLoadBuscador) || semanasLoadBuscador.length == 0 ?
                  (<div className="SBOX-BC-bot">
                    <div className="SBOX-BC-bot-topText">
                      Al hacer <b>clic sobre clase actual o próxima clase</b>, se abrírá dicha clase.
                      <br /><br />
                      Tiene disponible un buscador de clases por : <b>Categoria, nombre de la clase, tema semanal o número de clase.</b>
                    </div>
                    <div className="SBOX-BC-bot-bottomText">
                      <div className="SBOX-BC-bot-BT-img">
                        <img src="../img/Layer3.png" />
                      </div>
                      <div className="SBOX-BC-bot-BT-text">
                        <b>* Clase actual</b>: Tiene activado los ejercicios y temario. “Ejercicios a completar esta semana”.
                        <br /><br />
                        <b>* Próxima clase</b>: Tiene activado el temario (Legislación, videos y pdfs). “El temario a estudiar esta semana”.
                        <br /><br />
                        <b>* Los ejercicios de una clase se activán en el día y hora indicandos.</b>
                        <br /><br />
                        <b>* El temario y acceso a una clase, se activa 1 semana antes que los ejercicios.</b>
                      </div>
                    </div>
                  </div>) : (
                    <div className="SBOX-BC-bot2">

                      <div className="contentSOBOXBCBOT2">
                        {isDefined(semanasLoadBuscador) && semanasLoadBuscador.map((cls, key7) =>
                          <CajaInfoClase semanaFacturada={cls} keyProp={key7} actuales={false} />
                        )}
                      </div>

                    </div>
                  )
                }


              </div>
            </div>
          ) : null}


          {isDefined(semanaPrg) && isDefined(semPrgLoadFactura) ? (
            <React.Fragment>
              <div className="semSelFullContent">


                <div className="SSFC-top">
                  <div className="SSFC-T-changCurClas">
                    <div className="SSFC-T-CCC-left">
                      <div className="SSFC-T-CCC-title">
                        <b>{semanaPrg && semanaPrg.length > 0 && semanaPrg[0].nombreClase}</b>
                        {nombreClase}
                      </div>
                      <div className="SSFC-T-CCC-buttons">
                        <div style={{ width: '140px', marginTop: '10px', marginRight: '10px' }}>
                          <Boton id="changeCurso" icon1="" icon2="" texto="Cambiar Curso" onClick={this.onChangeBuscador} />
                        </div>
                        <div style={{ width: '140px', marginTop: '10px' }}>
                          <Boton id="closeClaseOpen" icon1="" icon2="" texto="Cambiar Clase" onClick={this.onChangeBuscador} />
                        </div>
                      </div>
                    </div>
                    {isDefined(semPrgLoadFactura) ? (
                      <div className="SSFC-T-CCC-right">
                        <CajaInfoClase semanaFacturada={semPrgLoadFactura} keyProp={0} actuales={false} />
                      </div>
                    ) : null
                    }

                  </div>

                  <div className="SSFC-T-videos">

                    <div className="SSFC-T-V-videos" style={{ marginRight: isDefined(semanaPrg[0].horaClaseOnline) && semanaPrg[0].horaClaseOnline != '00:00:00' ? ('0em') : ('0px') }}>
                      {semanaPrg && semanaPrg.length > 0 && semanaPrg[0].videosClase.length > 0 ? (
                        semanaPrg[0].videosClase.map((video, key8) =>

                          <div id={'recPlayVidDiv-' + key8} className="recPlayVidDiv" style={{ zIndex: '' + semanaPrg[0].videosClase.length - key8 }} onContextMenu={e => e.preventDefault()}>
                            <ReactPlayer
                              url={video.link}
                              className='react-player'
                              playing={false}
                              width='100%'
                              height='100%'
                              controls={true}
                              onContextMenu={e => e.preventDefault()}
                              config={{ file: { attributes: { controlsList: 'nodownload' } } }}
                            />

                            <div onClick={this.onChangeBuscador} id={"nextVideo-" + key8} className="nextRectPlaerClass" style={{ zIndex: "" + (semanaPrg[0].videosClase.length + 2) }} >
                              <i id={"nextVideo-" + key8} className="fas fa-angle-right"></i>
                            </div>
                            <div className="nextRectPlaerClass2" style={{ zIndex: "" + (semanaPrg[0].videosClase.length + 2) }} >
                              VIDEO CLASE SEMANAL <b>{this.state.vidActual + 1}</b>/{semanaPrg[0].videosClase.length}
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="recPlayVidDivNovideo">
                          Aún no esta el video de esta clase.
                        </div>
                      )

                      }

                    </div>
                    {isDefined(semanaPrg[0].horaClaseOnline) && semanaPrg[0].horaClaseOnline != '00:00:00' ?
                      (<div className="SSFC-T-V-claseDirecto">
                        <b>Clase en Directo</b>
                        <div>
                          {semanaPrg[0].horaClaseOnline && semanaPrg[0].horaClaseOnline != undefined ? (
                            moment(semanaPrg[0].horaClaseOnline).format('DD-MM-YY [a las] HH:mm')
                          ) : null

                          }
                        </div>

                        <div style={{ width: '140px', marginTop: '10px' }}>
                          <Boton id="entrarClase" icon1="" icon2="" texto="Entrar en Clase" onClick={this.onChangeBuscador} />
                        </div>

                        <div>
                          <p>¿No tienes Zoom? -<b id="goZoom" onClick={this.onChangeBuscador}>Clic aquí</b></p>
                        </div>
                      </div>
                      ) : null}


                  </div>


                </div>


                <div className="SSFC-bot">
                  <div className="SSFC-B-BloquesNav">
                    <div className="SSFC-B-BN-titule">
                      Bloques
                    </div>
                    <div className="SSFC-B-BN-navCont">
                      {semanaPrg && semanaPrg.length > 0 && semanaPrg[0].bloqueTemas.length > 0 ? (
                        semanaPrg[0].bloqueTemas.map((bloq, key9) =>
                          <div id={'bloqueGo-' + key9} className={bloqueSelected == key9 ? ("SSFC-B-BN-contnLinkS") : ("SSFC-B-BN-contnLink")} onClick={this.onChangeBuscador}>
                            {key9 + 1}
                          </div>
                        )) : null
                      }
                    </div>
                  </div>
                  <div className="SSFC-B-Temas">
                    {semanaPrg && semanaPrg.length > 0 && semanaPrg[0].bloqueTemas.length > 0 ? (
                      <React.Fragment>

                        <div className="SSFC-B-TemaLoad">

                          <div className="SSFC-B-TL-bloqueNn">
                            {'Nº '}{parseInt(bloqueSelected) + 1}{' - '}{semanaPrg[0].bloqueTemas[bloqueSelected].tipoBloque == 0 ? ('SEMANAL') : ('REPASO')}
                          </div>
                          <div className="SSFC-B-TL-navTemas">
                            {semanaPrg[0].bloqueTemas[bloqueSelected].temas.map((tema, key645tr) =>
                              <div id={'temaGo-' + key645tr}
                                className={temaSelected == key645tr ? ("SSFC-B-TL-ButonNavS") : ("SSFC-B-TL-ButonNav")}
                                onClick={this.onChangeBuscador}
                                style={{ borderLeft: key645tr > 0 ? ('1px solid #f1f1f1') : ('none') }}
                              >
                                {tema.nombreTema}
                                {tema.tituloTema != null && tema.tituloTema != '' ? (
                                  ' (' + tema.tituloTema + ')'
                                ) : null}

                              </div>
                            )}
                          </div>
                          <div className="SSFC-B-TL-temaLoaddf">
                            {isDefined(temaSelected) && semanaPrg[0].bloqueTemas[bloqueSelected].temas.length > 0 ?
                              (

                                <TemaSeleted idTema={semanaPrg[0].bloqueTemas[bloqueSelected].temas[temaSelected].idTema} />

                              ) : null
                            }

                          </div>

                          {/* {isDefined(temaSelected) && semanaPrg[0].bloqueTemas[bloqueSelected].temas.length > 0 && (

                            isDefined(semanaPrg[0].bloqueTemas[bloqueSelected].temas[temaSelected].nota)

                            ||

                            (
                              isDefined(temasFacturados.find(c => c.idTema == semanaPrg[0].bloqueTemas[bloqueSelected].temas[temaSelected].idTema)) &&
                              isDefined(temasFacturados.find(c => c.idTema == semanaPrg[0].bloqueTemas[bloqueSelected].temas[temaSelected].idTema).notaPreparador)
                            )


                          ) ?
                            (
                              <div className="SSFC-B-TL-notaTema">
                                <b>Nota del preparador</b>
                                <div className="SSFC-B-TL-notaTemaTexto">
                                  {

                                    semanaPrg[0].bloqueTemas[bloqueSelected].temas[temaSelected].nota != null ? (
                                      semanaPrg[0].bloqueTemas[bloqueSelected].temas[temaSelected].nota
                                    ) : (null)
                                  }

                                  {
                                    temasFacturados.find(c => c.idTema == semanaPrg[0].bloqueTemas[bloqueSelected].temas[temaSelected].idTema) != undefined && temasFacturados.find(c => c.idTema == semanaPrg[0].bloqueTemas[bloqueSelected].temas[temaSelected].idTema).notaPreparador != undefined && temasFacturados.find(c => c.idTema == semanaPrg[0].bloqueTemas[bloqueSelected].temas[temaSelected].idTema).notaPreparador != '' && temasFacturados.find(c => c.idTema == semanaPrg[0].bloqueTemas[bloqueSelected].temas[temaSelected].idTema).notaPreparador != null ? (
                                      temasFacturados.find(c => c.idTema == semanaPrg[0].bloqueTemas[bloqueSelected].temas[temaSelected].idTema).notaPreparador
                                    ) : (null)

                                  }
                                </div>
                              </div>
                            ) : null
                          } */}


                        </div>

                        <div className="SSFC-B-ejerLoad">

                          <div className="SSFC-B-TL-bloqueNn2">


                            {semanaPrg[0].bloqueTemas[bloqueSelected].testsJusticia.length > 0 ? (
                              <div id={'tipoEjerLoadTeorico'}
                                className={tipoEjerSelected == 'testTeorico' ? ("SSFC-B-TL-ButonNavS") : ("SSFC-B-TL-ButonNav")}
                                onClick={this.onChangeBuscador}
                                style={{ borderLeft: 'none' }}
                              >
                                Test Teórico
                              </div>
                            ) : null}

                            {semanaPrg[0].bloqueTemas[bloqueSelected].casosPractico.length > 0 ? (
                              <div id={'tipoEjerLoadPractic'}
                                className={tipoEjerSelected == 'testPractico' ? ("SSFC-B-TL-ButonNavS") : ("SSFC-B-TL-ButonNav")}
                                onClick={this.onChangeBuscador}
                                style={{ borderLeft: semanaPrg[0].bloqueTemas[bloqueSelected].testsJusticia.length > 0 ? ('1px solid #f1f1f1') : ('none') }}
                              >
                                Test Practico
                              </div>
                            ) : null}

                            {semanaPrg[0].bloqueTemas[bloqueSelected].examenesDesarrollo.length > 0 ? (
                              <div id={'tipoEjerLoadDesarrollo'}
                                className={tipoEjerSelected == 'testDesarrollo' ? ("SSFC-B-TL-ButonNavS") : ("SSFC-B-TL-ButonNav")}
                                onClick={this.onChangeBuscador}
                                style={{ borderLeft: semanaPrg[0].bloqueTemas[bloqueSelected].testsJusticia.length > 0 || semanaPrg[0].bloqueTemas[bloqueSelected].casosPractico.length > 0 ? ('1px solid #f1f1f1') : ('none') }}
                              >
                                Examen Desarrollo
                              </div>
                            ) : null}
                          </div>


                          <div className="SSFC-B-TL-navEjeerNe">

                            {tipoEjerSelected == 'testTeorico' ? (
                              semanaPrg[0].bloqueTemas[bloqueSelected].testsJusticia.map((test, key10) =>
                                <div id={'ejerToLoad-' + key10}
                                  className={testSelected == key10 ? ("SSFC-B-TL-ButonNavS") : ("SSFC-B-TL-ButonNav")}
                                  onClick={this.onChangeBuscador}
                                  style={{ borderLeft: key10 > 0 ? ('1px solid #f1f1f1') : ('none') }}
                                >
                                  Test {key10 + 1}
                                </div>
                              )
                            ) : null
                            }

                            {tipoEjerSelected == 'testPractico' ? (
                              semanaPrg[0].bloqueTemas[bloqueSelected].casosPractico.map((test, key11) =>
                                <div id={'ejerToLoad-' + key11}
                                  className={testSelected == key11 ? ("SSFC-B-TL-ButonNavS") : ("SSFC-B-TL-ButonNav")}
                                  onClick={this.onChangeBuscador}
                                  style={{ borderLeft: key11 > 0 ? ('1px solid #f1f1f1') : ('none') }}
                                >
                                  Test {key11 + 1}
                                </div>
                              )
                            ) : null
                            }

                            {/* {tipoEjerSelected == 'testDesarrollo' ? (
                              <div id={''}
                                className={"SSFC-B-TL-ButonNavS"}
                                onClick={this.onChangeBuscador}
                                style={{ borderLeft: 'none' }}
                              >
                                Examen Desarrollo
                              </div>

                            ) : null
                            } */}

                            {tipoEjerSelected == 'testDesarrollo' ? (
                              semanaPrg[0].bloqueTemas[bloqueSelected].examenesDesarrollo.map((test, key11x) =>
                                <div id={'ejerToLoad-' + key11x}
                                  className={testSelected == key11x ? ("SSFC-B-TL-ButonNavS") : ("SSFC-B-TL-ButonNav")}
                                  onClick={this.onChangeBuscador}
                                  style={{ borderLeft: key11x > 0 ? ('1px solid #f1f1f1') : ('none') }}
                                >
                                  Ejercicio {key11x + 1}
                                </div>
                              )
                            ) : null
                            }


                          </div>


                          <div className="SSFC-B-TL-ejerLoad">
                            {isDefined(testSelected) && tipoEjerSelected == 'testTeorico' ? (

                              semanaPrg[0].bloqueTemas[bloqueSelected].alumnos.find(a => a.idAlumno == this.props.idUser) != undefined && semanaPrg[0].bloqueTemas[bloqueSelected].alumnos.find(a => a.idAlumno == this.props.idUser).testJusticiaResultados.length > 0 && semanaPrg[0].bloqueTemas[bloqueSelected].alumnos.find(a => a.idAlumno == this.props.idUser).testJusticiaResultados.find(t => t.idTest == semanaPrg[0].bloqueTemas[bloqueSelected].testsJusticia[testSelected].idTestJusticia) != undefined ? (
                                <React.Fragment>
                                  <div className="SSFC-B-TL-eL-testInfo">
                                    <div className="SSFC-B-TL-eL-testInfoResultado">
                                      <div className="SSFC-B-TL-eL-title"> Ultimo Resultado </div>
                                      <div className="SSFC-B-TL-eL-puntos">
                                        {semanaPrg[0].bloqueTemas[bloqueSelected].alumnos.find(a => a.idAlumno == this.props.idUser).testJusticiaResultados.find(t => t.idTest == semanaPrg[0].bloqueTemas[bloqueSelected].testsJusticia[testSelected].idTestJusticia).puntuacion}
                                      </div>

                                      <div className="SSFC-B-TL-eL-resultados">
                                        {semanaPrg[0].bloqueTemas[bloqueSelected].alumnos.find(a => a.idAlumno == this.props.idUser).testJusticiaResultados.find(t => t.idTest == semanaPrg[0].bloqueTemas[bloqueSelected].testsJusticia[testSelected].idTestJusticia).correctas} <i className="fas fa-check-circle" />
                                      </div>
                                      <div className="SSFC-B-TL-eL-resultados">
                                        {semanaPrg[0].bloqueTemas[bloqueSelected].alumnos.find(a => a.idAlumno == this.props.idUser).testJusticiaResultados.find(t => t.idTest == semanaPrg[0].bloqueTemas[bloqueSelected].testsJusticia[testSelected].idTestJusticia).erroneas} <i className="fas fa-times-circle" />
                                      </div>
                                      <div className="SSFC-B-TL-eL-resultados">
                                        {semanaPrg[0].bloqueTemas[bloqueSelected].alumnos.find(a => a.idAlumno == this.props.idUser).testJusticiaResultados.find(t => t.idTest == semanaPrg[0].bloqueTemas[bloqueSelected].testsJusticia[testSelected].idTestJusticia).enBlanco} <i className="far fa-circle" />
                                      </div>
                                    </div>
                                    <div>
                                      <div className="SSFC-B-TL-eL-boton">
                                        <Boton id="repetirTestJus" icon1="" icon2="" texto="Hacer Test" onClick={this.onChangeBuscador} />
                                      </div>
                                    </div>

                                  </div>

                                  <div className="SSFC-B-TL-eL-Ranking">
                                    {isDefined(semanaPrg[0].bloqueTemas[bloqueSelected].testsJusticia[testSelected].ranking1) && semanaPrg[0].bloqueTemas[bloqueSelected].testsJusticia[testSelected].ranking1.length > 0 ? (
                                      <Ranking rank={semanaPrg[0].bloqueTemas[bloqueSelected].testsJusticia[testSelected].ranking1} />
                                    ) : (
                                      <img src="../img/noRanking.jpg" />
                                    )}
                                  </div>

                                </React.Fragment>
                              ) : (
                                <React.Fragment>
                                  <div className="SSFC-B-TL-eL-testInfo">
                                    <div className="SSFC-B-TL-eL-boton">
                                      <Boton id="realizarTestJus" icon1="" icon2="" texto="Realizar Test" onClick={this.onChangeBuscador} />
                                    </div>
                                  </div>

                                  <div className="SSFC-B-TL-eL-Ranking">
                                    {isDefined(semanaPrg[0].bloqueTemas[bloqueSelected].testsJusticia[testSelected].ranking1) && semanaPrg[0].bloqueTemas[bloqueSelected].testsJusticia[testSelected].ranking1.length > 0 ? (
                                      <Ranking rank={semanaPrg[0].bloqueTemas[bloqueSelected].testsJusticia[testSelected].ranking1} />
                                    ) : (
                                      <img src="../img/noRanking.jpg" />
                                    )}
                                  </div>

                                </React.Fragment>
                              )
                            ) : null

                            }


                            {isDefined(testSelected) && tipoEjerSelected == 'testPractico' ? (

                              semanaPrg[0].bloqueTemas[bloqueSelected].alumnos.find(a => a.idAlumno == this.props.idUser) != undefined && semanaPrg[0].bloqueTemas[bloqueSelected].alumnos.find(a => a.idAlumno == this.props.idUser).casoPracticoResultados.length > 0 && semanaPrg[0].bloqueTemas[bloqueSelected].alumnos.find(a => a.idAlumno == this.props.idUser).casoPracticoResultados.find(t => t.idTest == semanaPrg[0].bloqueTemas[bloqueSelected].casosPractico[testSelected].idCasoPractico) != undefined ? (
                                <React.Fragment>
                                  <div className="SSFC-B-TL-eL-testInfo">
                                    <div className="SSFC-B-TL-eL-testInfoResultado">
                                      <div className="SSFC-B-TL-eL-title"> Ultimo Resultado </div>
                                      <div className="SSFC-B-TL-eL-puntos">
                                        {semanaPrg[0].bloqueTemas[bloqueSelected].alumnos.find(a => a.idAlumno == this.props.idUser).casoPracticoResultados.find(t => t.idTest == semanaPrg[0].bloqueTemas[bloqueSelected].casosPractico[testSelected].idCasoPractico).puntuacion}
                                      </div>

                                      <div className="SSFC-B-TL-eL-resultados">
                                        {semanaPrg[0].bloqueTemas[bloqueSelected].alumnos.find(a => a.idAlumno == this.props.idUser).casoPracticoResultados.find(t => t.idTest == semanaPrg[0].bloqueTemas[bloqueSelected].casosPractico[testSelected].idCasoPractico).correctas} <i className="fas fa-check-circle" />
                                      </div>
                                      <div className="SSFC-B-TL-eL-resultados">
                                        {semanaPrg[0].bloqueTemas[bloqueSelected].alumnos.find(a => a.idAlumno == this.props.idUser).casoPracticoResultados.find(t => t.idTest == semanaPrg[0].bloqueTemas[bloqueSelected].casosPractico[testSelected].idCasoPractico).erroneas} <i className="fas fa-times-circle" />
                                      </div>
                                      <div className="SSFC-B-TL-eL-resultados">
                                        {semanaPrg[0].bloqueTemas[bloqueSelected].alumnos.find(a => a.idAlumno == this.props.idUser).casoPracticoResultados.find(t => t.idTest == semanaPrg[0].bloqueTemas[bloqueSelected].casosPractico[testSelected].idCasoPractico).enBlanco} <i className="far fa-circle" />
                                      </div>
                                    </div>
                                    <div>
                                      <div className="SSFC-B-TL-eL-boton">
                                        <Boton id="repetirCasoPracticoBloque" icon1="" icon2="" texto="Hacer Test" onClick={this.onChangeBuscador} />
                                      </div>
                                    </div>

                                  </div>

                                  <div className="SSFC-B-TL-eL-Ranking">
                                    {isDefined(semanaPrg[0].bloqueTemas[bloqueSelected].casosPractico[testSelected].ranking1) && semanaPrg[0].bloqueTemas[bloqueSelected].casosPractico[testSelected].ranking1.length > 0 ? (
                                      <Ranking rank={semanaPrg[0].bloqueTemas[bloqueSelected].casosPractico[testSelected].ranking1} />
                                    ) : (
                                      <img src="../img/noRanking.jpg" />
                                    )}
                                  </div>

                                </React.Fragment>
                              ) : (
                                <React.Fragment>
                                  <div className="SSFC-B-TL-eL-testInfo">
                                    <div className="SSFC-B-TL-eL-boton">
                                      <Boton id="realizarCasoPracticoBloque" icon1="" icon2="" texto="Realizar Test" onClick={this.onChangeBuscador} />
                                    </div>
                                  </div>

                                  <div className="SSFC-B-TL-eL-Ranking">
                                    {isDefined(semanaPrg[0].bloqueTemas[bloqueSelected].casosPractico[testSelected].ranking1) && semanaPrg[0].bloqueTemas[bloqueSelected].casosPractico[testSelected].ranking1.length > 0 ? (
                                      <Ranking rank={semanaPrg[0].bloqueTemas[bloqueSelected].casosPractico[testSelected].ranking1} />
                                    ) : (
                                      <img src="../img/noRanking.jpg" />
                                    )}
                                  </div>

                                </React.Fragment>
                              )
                            ) : null

                            }

                            {isDefined(testSelected) && tipoEjerSelected == 'testDesarrollo' ? (

                              semanaPrg[0].bloqueTemas[bloqueSelected].examenesDesarrollo[testSelected].examenExiste != false ? (

                                isDefined(semanaPrg[0].bloqueTemas[bloqueSelected].examenesDesarrollo[testSelected].examenPuntuacion) ? (
                                  <React.Fragment>
                                    <div className="SSFC-B-TL-eL-testInfo">
                                      <div className="SSFC-B-TL-eL-testInfoResultado">
                                        <div className="SSFC-B-TL-eL-title" style={{ marginRight: '0px' }}> Resultado <b> {semanaPrg[0].bloqueTemas[bloqueSelected].examenesDesarrollo[testSelected].examenPuntuacion}</b></div>

                                      </div>
                                      <div className="SSFC-B-TL-eL-testInfoResultado">
                                        <div className="SSFC-B-TL-eL-boton2">
                                          <Boton id="descargarPdfExaGesAlumn" icon1="" icon2="" texto="Mi examen" onClick={this.onChangeBuscador} />
                                        </div>
                                        <div className="SSFC-B-TL-eL-boton2">
                                          <Boton id="descargarPdfExaGesSolucion" icon1="" icon2="" texto="Solución" onClick={this.onChangeBuscador} />
                                        </div>
                                      </div>

                                    </div>
                                    <div className="SSFC-B-TL-eL-Ranking">

                                      {isDefined(semanaPrg[0].bloqueTemas[bloqueSelected].examenesDesarrollo[testSelected].notaExamenDesarollo) ? (
                                        <div className="SSFC-B-TL-eL-notaPrepa">
                                          {ReactHtmlParser(semanaPrg[0].bloqueTemas[bloqueSelected].examenesDesarrollo[testSelected].notaExamenDesarollo)}
                                        </div>
                                      ) : null}

                                      <img src="../img/examDesarrolloCompleted.jpg" />
                                    </div>
                                  </React.Fragment>
                                ) : (
                                  <React.Fragment>
                                    <div className="SSFC-B-TL-eL-testInfo">


                                      {semanaPrg[0].bloqueTemas[bloqueSelected].examenesDesarrollo[testSelected].fechaExaEntregaA != null &&
                                        moment(semanaPrg[0].bloqueTemas[bloqueSelected].examenesDesarrollo[testSelected].fechaExaEntregaA).format('YYYY-MM-DD') <=
                                        moment(semanaPrg[0].FechaTestClase).add(7, 'd').format('YYYY-MM-DD') ? (
                                        <div className="SSFC-B-TL-eL-testInfoResultado">
                                          <div className="SSFC-B-TL-eL-title" style={{ marginRight: '0px' }}>
                                            Pediente de Corrección
                                          </div>
                                        </div>
                                      ) : (

                                        // <div className="SSFC-B-TL-eL-testInfoResultado">
																				// 	<div className="SSFC-B-TL-eL-title" style={{
																				// 		marginRight: '0px',
																				// 		alignItems: 'center',
																				// 		justifyContent: 'center',
																				// 		display: 'flex',
																				// 		flexFlow: 'column nowrap'
																				// 	}}>
																				// 		<b style={{ fontWeight: '500' }}>Auto-Corrección</b>


																				// 	</div>

																				// 	<div className="SSFC-B-TL-eL-boton2">
																				// 		<Boton id="descargarPdfExaGesSolucion" icon1="" icon2="" texto="Descargar examen" onClick={this.onChangeBuscador} />
																				// 	</div>


																				// </div>

                                        <div className="SSFC-B-TL-eL-testInfoResultado">
                                          <div className="SSFC-B-TL-eL-title" style={{
                                            marginRight: '0px',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            display: 'flex',
                                            flexFlow: 'column nowrap'
                                          }}>
                                            <b style={{ fontWeight: '500' }}>Auto-Corrección</b>

                                          </div>
                                          <div className="SSFC-B-TL-eL-boton2">
																						<Boton id="descargarPdfExaGes" icon1="" icon2="" texto="Descargar examen" onClick={this.onChangeBuscador} />
																					</div>

                                        </div>
                                      )
                                      }

                                      <div className="SSFC-B-TL-eL-testInfoResultado">
                                        <div className="SSFC-B-TL-eL-boton2">
                                          <Boton id="descargarPdfExaGesAlumn" icon1="" icon2="" texto="Mi examen" onClick={this.onChangeBuscador} />
                                        </div>
                                        <div className="SSFC-B-TL-eL-boton2">
                                          <Boton id="descargarPdfExaGesSolucion" icon1="" icon2="" texto="Solución" onClick={this.onChangeBuscador} />
                                        </div>
                                      </div>

                                    </div>
                                    <div className="SSFC-B-TL-eL-Ranking">

                                      <div className="SSFC-B-TL-eL-notaPrepa">
                                        {semanaPrg[0].bloqueTemas[bloqueSelected].examenesDesarrollo[testSelected].fechaExaEntregaA != null &&
                                          moment(semanaPrg[0].bloqueTemas[bloqueSelected].examenesDesarrollo[testSelected].fechaExaEntregaA).format('YYYY-MM-DD') <=
                                          moment(semanaPrg[0].FechaTestClase).add(7, 'd').format('YYYY-MM-DD') ? (
                                          'Puede descargar la solución, pronto corregiremos su examen.'
                                        ) : (
                                          'Puede descargar la solución, modo auto-evaluación.'
                                        )}

                                      </div>

                                      <img src="../img/examDesarrolloCompleted.jpg" />
                                    </div>
                                  </React.Fragment>
                                )



                              ) : (
                                <React.Fragment>
                                  <div className="SSFC-B-TL-eL-testInfo">
                                    <div className="SSFC-B-TL-eL-testInfoResultado">
                                      <div className="SSFC-B-TL-eL-title"> Subir examen en .pdf </div>

                                    </div>
                                    <div className="SSFC-B-TL-eL-testInfoResultado">
                                      <div className="SSFC-B-TL-eL-boton2">
                                        <Boton id="descargarPdfExaGes" icon1="" icon2="" texto="Descargar examen" onClick={this.onChangeBuscador} />
                                      </div>
                                      <div className="SSFC-B-TL-eL-boton2">

                                        <InputFileExamDesa onChange={this.myFiles} name="examGest" texto="Subir examen" />
                                      </div>
                                    </div>

                                  </div>

                                  <div className="SSFC-B-TL-eL-Ranking">
                                    <img src="../img/examDesarrollo.jpg" />
                                  </div>

                                </React.Fragment>
                              )
                            ) : null

                            }
                          </div>

                          <div className="backGrodEjerClaseBloq" id="verEjer" onClick={this.onChangeBuscador}>
                            <div className="botonEjeercicosBcl" id="verEjer">
                              Ejercicios
                            </div>
                            <img src="../img/ejerBloque.jpg" id="verEjer" />
                            <div className="color-overlay"></div>
                          </div>


                        </div>

                      </React.Fragment>
                    ) : null

                    }
                  </div>
                </div>



              </div>
            </React.Fragment>

          ) : null}

          {
            // temasFacturados         temaAulaLoad
          }
          {/* {isDefined(idClase) && semanasFacturadas == null && isDefined(temasFacturados) && !isDefined(temaAulaLoad) ? */}
          {isDefined(idClase) && semanasFacturadas == null && isDefined(temasFacturados) ? (
            <div className="aVA-SelCurso2">

              <div className="aVA-S-changeCurso">
                <div className="aVA-S-changeCursoTtile">
                  {nombreClase}
                </div>
                <div style={{ width: '140px', marginTop: '10px' }}>
                  <Boton id="changeCurso" icon1="" icon2="" texto="Cambiar Curso" onClick={this.onChangeBuscador} />
                </div>
              </div>
              <div className="aVA-SC-busquedaSem" style={{ marginTop: '55px' }}>
                {modoTemasEstudio == null ? (
                  <React.Fragment>
                    <div className="aVA-SC-title">
                      ¿Como quiere estudiar?
                    </div>
                    <div className="aVA-SC-topSemanasBox" style={{ flexFlow: 'column nowrap' }}>
                      <div style={{ marginBottom: '15px' }}>
                        <Boton id="recomendacionEstudio" icon1="" icon2="" texto="CON PLAN DE ESTUDIO" onClick={this.onClickTem} />
                      </div>
                      <div>
                        <Boton id="miRitmo" icon1="" icon2="" texto="A MI PROPIO RITMO" onClick={this.onClickTem} />
                      </div>
                    </div>
                  </React.Fragment>
                ) : (
                  modoTemasEstudio != null && modoTemasEstudio == 'recomendacion' ? (
                    <React.Fragment>
                      <div className="aVA-SC-title">
                        Plan de estudio
                      </div>
                      <div className="aVA-SC-topSemanasBox" style={{ flexFlow: 'column nowrap' }}>

                        <div>
                          <Boton id="miRitmo" icon1="" icon2="" texto="IR A BUSCADOR TEMAS" onClick={this.onClickTem} />
                        </div>
                      </div>
                      {modoRecomendacionEstudio != null && modoRecomendacionEstudio.estado == true ? (
                        <div className='recomendacionInfoLista'>
                          <p>
                            Plan de estudio configurado en modo {modoRecomendacionEstudio.tipo}, duración de {modoRecomendacionEstudio.tipoMensualidad} {modoRecomendacionEstudio.tipoMensualidad == 1 ? ('mes') : ('meses')} iniciada el {moment(modoRecomendacionEstudio.fechaInicio).format('DD-MM-YY')}
                          </p>
                          <div>
                            <Boton id="cambiarRecomendacion" icon1="" icon2="" texto="Configurar plan estudio" onClick={this.onClickTem} />
                          </div>
                        </div>
                      ) : null
                      }
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <div className="aVA-SC-title">
                        BUSCADOR TEMAS
                      </div>
                      <div className="aVA-SC-topSemanasBox" style={{ flexFlow: 'column nowrap' }}>
                        <div style={{ marginBottom: '15px' }}>
                          <Boton id="recomendacionEstudio" icon1="" icon2="" texto="IR A PLAN DE ESTUDIO" onClick={this.onClickTem} />
                        </div>

                      </div>
                    </React.Fragment>
                  )
                )}
              </div>
              <div className="aVA-SC-semanasBusqeda">

                {isDefined(temasFacturados) ? (
                  <div className="SBOX-busqueda-content">
                    {
                      isDefined(modoTemasEstudio) && modoTemasEstudio != 'recomendacion' ? (
                        <div className="SBOX-BC-top">

                          <div style={{ maxWidth: '200px', marginRight: '5px', marginTop: '5px' }}>
                            <Input2 type="text" id="categoria" name="categoria" placeholder="Categoria" icon="fas fa-search" datalist="categoriass" ref="ref_categoria" onChange={this.onChangeBuscadorTemas} />
                            <datalist id="categoriass">
                              {categoriasJusticia && categoriasJusticia.map((cls, key3) =>
                                <option key={key3} value={cls.nombre}></option>
                              )}
                            </datalist>
                          </div>
                          <div style={{ maxWidth: '200px', marginRight: '5px', marginTop: '5px' }}>
                            <Input2 type="text" id="tema" name="tema" placeholder="Tema" icon="fas fa-search" datalist="temass" ref="ref_tema" onChange={this.onChangeBuscadorTemas} />
                            <datalist id="temass">
                              {temasFacturados && temasFacturados.map((cls, key4) =>
                                <option key={key4} value={cls.titulo_tema}>{cls.titulo_tema + ' (' + cls.nombre_tema + ')'}</option>
                              )}
                            </datalist>
                          </div>

                        </div>
                      ) : null
                    }

                  </div>
                ) : null}

                {!isDefined(modoTemasEstudio) ?
                  (<div className="SBOX-BC-bot">

                    <div className="SBOX-BC-bot-bottomText">
                      <div className="SBOX-BC-bot-BT-img">
                        <img src="../img/Layer3.png" />
                      </div>
                      <div className="SBOX-BC-bot-BT-text">
                        <b>Plan de estudio</b><br /> Le indicamos que temas estudiar y repasar cada semana. Usted elige el tiempo de estudio 3,6,9 o 12 meses.
                        <br /><br />
                        <b>Buscador temas</b><br /> Listado de todos los temas con buscador por categoria o nombre del tema.
                        <br /><br />
                        <b>El número de vueltas de cada tema</b>, esta sincronizado en los 2 modos.

                      </div>
                    </div>
                  </div>) : null
                }


                {
                  isDefined(modoTemasEstudio) && modoTemasEstudio == 'recomendacion' ?
                    (

                      <div className="SBOX-BC-bot" style={{ maxWidth: '890px' }}>
                        {modoRecomendacionEstudio == null ? (
                          <div className="SBOX-BC-bot-configRecomendacion">
                            <div className='ColCenterStart'>
                              <h3> ¿Qué modo para el plan de estudio, desea comenzar?</h3>
                              <p>Podrá cambiarlo en cualquier momento</p>
                            </div>

                            <div className="SBOX-BC-bot-configRecomendacion">


                              <div style={{ margin: '15px', maxWidth: '250px' }}>

                                <Boton id="selectedNormal" icon1="" icon2="" texto="Normal - 1ª Vez" onClick={this.onClickTem} />
                                <p> Para aquellos alumnos que es su primera vez o no dominan la matería, plan de estudio de 6 o {this.props.idOposicion != 8 && this.props.idOposicion != 9 ? (' 12 ') : (' 10 ')} meses. </p>
                              </div>

                              <div style={{ margin: '15px', maxWidth: '250px' }}>
                                <Boton id="selectedRepaso" icon1="" icon2="" texto="Repaso - 2ª y sucesivas" onClick={this.onClickTem} />
                                <p> Para aquellos alumnos que dominan la matería y quieren seguir preparandose. Plan de estudio de 3 , 6 o {this.props.idOposicion != 8 && this.props.idOposicion != 9 ? (' 12 ') : (' 10 ')} meses. </p>
                              </div>

                              <div style={{ margin: '15px', maxWidth: '250px' }}>
                                <Boton id="selectedIntensivo" icon1="" icon2="" texto="Intensivo - Previo examen" onClick={this.onClickTem} />
                                <p> Para aquellos alumnos que van a presentarse a examen examen plan de 1 o 3 meses. </p>
                              </div>

                            </div>
                          </div>
                        ) : null}

                        {modoRecomendacionEstudio != null && modoRecomendacionEstudio.tipoMensualidad == null ? (
                          <div>
                            <h3> Seleccione en cuanto tiempo desea prepararse</h3>
                            <div className="SBOX-BC-bot-configRecomendacion">

                              {modoRecomendacionEstudio.mensual.map((x) =>

                                <div style={{ margin: '15px', maxWidth: '250px' }}>

                                  <Boton id={'mensual-' + x} icon1="" icon2="" texto={x > 1 ? (x + ' Meses') : (x + " Mes")} onClick={this.onClickTem} />

                                </div>

                              )}



                            </div>
                          </div>
                        ) : null}

                        {modoRecomendacionEstudio != null && modoRecomendacionEstudio.tipoMensualidad != null && (modoRecomendacionEstudio.fechaInicio == null || modoRecomendacionEstudio.estado == null) ? (
                          <div>
                            <h3> Seleccione el primer día para iniciar el plan de estudio</h3>
                            <div className="SBOX-BC-bot-configRecomendacion2">

                              <div className="celdaInputDAPFBN" style={{ marginTop: '35px' }}>
                                <Input2
                                  autoComplete={"off"} id={"fechaInicioCurso"} type="date" name={"fechaInicioCurso"} ref={"fechaInicioCurso"} placeholder="Fecha" icon="fa-light fa-calendar-day" onChange={this.onClickTem} />
                                <p>Fecha Inicio</p>
                              </div>

                              {modoRecomendacionEstudio.fechaInicio != null && modoRecomendacionEstudio.fechaInicio != '' ? (<div style={{ margin: '15px' }}>

                                <Boton id={'generarRecomendacion'} icon1="" icon2="" texto={'Generar plan de estudio'} onClick={this.onClickTem} />

                              </div>) : null}

                            </div>
                          </div>
                        ) : null}

                        {modoRecomendacionEstudio != null && semanasPrgCurso != null && semanasPrgCurso.length > 0 && modoRecomendacionEstudio.estado == true ? (

                          <CajaInfoSemanaCurso />


                        ) : (
                          modoRecomendacionEstudio != null && modoRecomendacionEstudio.estado == true && (semanasPrgCurso == null || semanasPrgCurso.length == 0) ? (
                            <h3 style={{ marginTop: '25px', color: '#3469b7' }}> Cargando plan de estudio</h3>
                          ) : null
                        )}


                      </div>

                    ) : null
                }

                {
                  isDefined(modoTemasEstudio) && modoTemasEstudio == 'miRitmo' ?
                    (
                      temasBusqueda == null ? (


                        <div className="SBOX-BC-bot">

                          <div className="SBOX-BC-bot-bottomText">
                            <div className="SBOX-BC-bot-BT-img" style={{ marginTop: '75px' }}>
                              <img src="../img/Layer3.png" />
                            </div>
                            <div className="SBOX-BC-bot-BT-text">
                              <div style={{ marginBottom: '15px', marginBottom: '15px', display: 'flex', flexFlow: 'row wrap', alignContent: 'center', justifyContent: 'center' }}>

                                {
                                  listadoTemasOn == null && temasBusqueda != this.props.temasFacturados ? (
                                    <Boton id="verTodosTemas" icon1="" icon2="" texto="VER LISTADO DE TEMAS" onClick={this.onClickTem} />
                                  ) : null
                                }
                                {
                                  temasBusqueda != null ? (
                                    <Boton id="resetBusqueda" icon1="" icon2="" texto="RESETAR BUSQUEDA" onClick={this.onClickTem} />
                                  ) : null
                                }



                              </div>
                              Al hacer <b>clic sobre un tema</b>, se abrírá dicho tema con los materiales de estudio.<br />

                              Tiene disponible el buscador de temas por <b>Categorías y nombre de temas</b>

                              <br /><br />

                              <b>¿Como se completa una vuelta a un tema? </b> <br />
                              Una vez abierto el tema puede darle clic al boton “completar vuelta”, para llevar el control de lo estudiado.
                              <br /><br />
                              <b>¿Qué incluye un tema? </b><br />
                              Legislación a estudiar, materiales de estudio descargables y videos.
                              <br /><br />
                              <b>¿Los ejercicios "test" ? </b><br />
                              Puede acceder a ellos desde el plan de estudio, cada semana tendrá X ejercicios para un conjunto de temas.
                              <br /><br />
                              <b>El número de vueltas comienza en 1</b>, es decir, le indica la vuelta actual que esta realizando.

                            </div>
                          </div>
                        </div>
                      ) : (
                        <React.Fragment>
                          {temaAulaLoad == null ? (
                            <React.Fragment>
                              <div className="menuBotonesLoadTemas">

                                {
                                  listadoTemasOn == null && temasBusqueda != this.props.temasFacturados ? (
                                    <Boton id="verTodosTemas" icon1="" icon2="" texto="VER LISTADO DE TEMAS" onClick={this.onClickTem} />
                                  ) : null
                                }
                                {
                                  temasBusqueda != null ? (
                                    <Boton id="resetBusqueda" icon1="" icon2="" texto="RESETEAR BUSQUEDA" onClick={this.onClickTem} />
                                  ) : null
                                }



                              </div>

                              <div className='temasFiltradosTabDiv'>


                                {temasBusqueda.map((tem, key0) =>
                                  <CajaInfoTema tema={tem} key={key0} />
                                )}

                              </div>
                            </React.Fragment>
                          ) : null}

                          {temaAulaLoad != null ? (
                            <div>

                              <div style={{ marginTop: '10px', display: 'flex', flexFlow: 'row wrap', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 12px' }}>

                                <Boton id="closeClaseOpen" icon1="" icon2="" texto="Cambiar tema" onClick={this.onHandleClick} />
                                <div style={{ padding: '10px', color: '#3469b7' }}>
                                  <b>Vuelta
                                    {numVueltasTemas23 && numVueltasTemas23.length > 0 && numVueltasTemas23.find(t => t.id_tema == temaAulaLoad) != undefined ? (
                                      ' nº ' + numVueltasTemas23.find(t => t.id_tema == temaAulaLoad).num_vuelta
                                    ) : (': 1')}
                                  </b>
                                </div>
                                <Boton id="completarVuelta" icon1="" icon2="" texto="Completar vuelta" onClick={this.onHandleClick} />

                              </div>
                              <TemaSeleted idTema={temaAulaLoad} />

                              {/* {temasFacturados && temasFacturados.length > 0 && temasFacturados.find(t => t.idTema == temaAulaLoad) != undefined && temasFacturados.find(t => t.idTema == temaAulaLoad).notaPreparador != null && temasFacturados.find(t => t.idTema == temaAulaLoad).notaPreparador != '' ? (

                                <div className="SSFC-B-TL-notaTema">
                                  <b>Nota del preparador</b>
                                  <div className="SSFC-B-TL-notaTemaTexto">
                                    {

                                      temasFacturados.find(t => t.idTema == temaAulaLoad).notaPreparador != null && temasFacturados.find(t => t.idTema == temaAulaLoad).notaPreparador != '' ? (
                                        temasFacturados.find(t => t.idTema == temaAulaLoad).notaPreparador
                                      ) : (null)
                                    }

                                  </div>
                                </div>
                              ) : null} */}

                            </div>
                          ) : null}


                        </React.Fragment>
                      )

                    ) : null
                }





              </div>
            </div>
          ) : null}

          {/* {isDefined(idClase) && isDefined(temasFacturados) && semanasFacturadas == null && isDefined(temaAulaLoad) ? (

            <AulaVirtualTema />

          ) : null} */}

        </div>
      );
    } else {
      return (<Redirect to="/" />);
    }
  }
}
// Conectamos Redux Store
function mapStateToProps(state) {
  return {
    isLogged: state.user.isLogged,
    idUser: state.user.idUser,
    idClase: state.user.idClase,
    nombreUser: state.user.nombreUser,
    tipoUser: state.user.tipoUser,
    fotoPerfil: state.user.fotoPerfil,
    claseCargada: state.user.claseCargada,
    temasFacturados: state.user.temasFacturados,
    testJusticiaUserLoad: state.user.testJusticiaUserLoad,
    casoPracticoUserLoad: state.user.casoPracticoUserLoad,
    semanasFacturadas: state.user.semanasFacturadas,
    semanaPrg: state.user.semanaPrg,
    nombreClase: state.user.nombreClase,
    allSemFac: state.user.allSemFac,
    semPrgLoadFactura: state.user.semPrgLoadFactura,
    escritorioTema: state.user.escritorioTema,
    userAccesoTemas: state.user.userAccesoTemas,
    temaAulaLoad: state.user.temaAulaLoad,
    idOposicion: state.user.idOposicion,
    semanasPrgCurso: state.user.semanasPrgCurso
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    loadTestUser,
    borrarTestUser,
    borrarCP,
    loadCPUser,
    cronoFunc,
    loadCurso,
    loadClase,
    loadTemasFacturados,
    loadAllSemFac,
    loadSemanaPrg,
    loadTemaAula,
    loadSemanasCurso

  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(AulaVirtualAlumnos);
