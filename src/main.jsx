// Archivo principal con los módulos de Venta e Inversión
const { useState } = React;

// Componente raíz que controla la navegación entre módulos
function App() {
  const [module, setModule] = useState('venta');
  const [capitalDisponible, setCapitalDisponible] = useState(0);
  const [netoVenta, setNetoVenta] = useState(0);

  // Guarda el neto de la venta para usarlo en el módulo de inversión
  const handleNeto = (valor) => {
    setNetoVenta(valor);
    setCapitalDisponible(valor);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <header className="mb-4 flex gap-4">
        <button className={`px-4 py-2 rounded ${module==='venta'?'bg-blue-600 text-white':'bg-gray-200'}`} onClick={() => setModule('venta')}>Venta</button>
        <button className={`px-4 py-2 rounded ${module==='inversion'?'bg-blue-600 text-white':'bg-gray-200'}`} onClick={() => setModule('inversion')}>Inversión</button>
      </header>
      {module === 'venta' ? (
        <VentaCalculator onNeto={handleNeto} />
      ) : (
        <InversionSimulator capitalDisponible={capitalDisponible} setCapitalDisponible={setCapitalDisponible} />
      )}
    </div>
  );
}

// Calculadora de venta de vivienda. Devuelve el dinero neto tras la operación.
function VentaCalculator({ onNeto }) {
  const [precioVenta, setPrecioVenta] = useState(300000);
  const [precioCompra, setPrecioCompra] = useState(200000);
  const [añosPropiedad, setAñosPropiedad] = useState(5);
  const [hipotecaPendiente, setHipotecaPendiente] = useState(60000);
  const [gastos, setGastos] = useState({
    plusvaliaMunicipal: 7,
    impuestoRenta: 19,
    comisionAgencia: 4,
    notaria: 0.3,
    registro: 0.15,
    gestoria: 0.5,
    otros: 1.2,
  });

  const plusvalia = Math.max(precioVenta - precioCompra, 0);
  const plusvaliaMunicipal = plusvalia * (gastos.plusvaliaMunicipal / 100);

  // Calcula el impuesto sobre la renta por ganancia patrimonial según tramos
  function calcIRPF(gain) {
    let restante = gain;
    let impuesto = 0;
    const tramos = [
      { limite: 6000, tipo: 0.19 },
      { limite: 44000, tipo: 0.21 },
      { limite: Infinity, tipo: 0.23 },
    ];
    for (const tramo of tramos) {
      const importe = Math.min(restante, tramo.limite);
      impuesto += importe * tramo.tipo;
      restante -= importe;
      if (restante <= 0) break;
    }
    return impuesto;
  }

  const impuestoRenta = calcIRPF(plusvalia);
  const comision = precioVenta * (gastos.comisionAgencia / 100);
  const notaria = precioVenta * (gastos.notaria / 100);
  const registro = precioVenta * (gastos.registro / 100);
  const gestoria = precioVenta * (gastos.gestoria / 100);
  const otros = precioVenta * (gastos.otros / 100);

  const totalGastos = plusvaliaMunicipal + impuestoRenta + comision + notaria + registro + gestoria + otros + hipotecaPendiente;
  const neto = precioVenta - totalGastos;

  // Actualiza el neto calculado al cambiar cualquier dato
  React.useEffect(() => {
    onNeto(neto);
  }, [neto]);

  // Actualiza porcentajes de gasto de forma dinámica
  const handleGastoChange = (campo, valor) => {
    setGastos(prev => ({ ...prev, [campo]: parseFloat(valor) }));
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Módulo 1: Venta de Vivienda</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block">Precio Venta (€)</label>
          <input type="number" className="border p-2 w-full" value={precioVenta} onChange={e=>setPrecioVenta(parseFloat(e.target.value)||0)} />
        </div>
        <div>
          <label className="block">Precio Compra (€)</label>
          <input type="number" className="border p-2 w-full" value={precioCompra} onChange={e=>setPrecioCompra(parseFloat(e.target.value)||0)} />
        </div>
        <div>
          <label className="block">Años Propiedad</label>
          <input type="number" className="border p-2 w-full" value={añosPropiedad} onChange={e=>setAñosPropiedad(parseInt(e.target.value)||0)} />
        </div>
        <div>
          <label className="block">Hipoteca Pendiente (€)</label>
          <input type="number" className="border p-2 w-full" value={hipotecaPendiente} onChange={e=>setHipotecaPendiente(parseFloat(e.target.value)||0)} />
        </div>
      </div>

      <h3 className="text-lg font-semibold mt-4 mb-2">Gastos (%)</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.keys(gastos).map(key => (
          <div key={key}>
            <label className="block capitalize">{key}</label>
            <input type="number" className="border p-2 w-full" value={gastos[key]} onChange={e=>handleGastoChange(key,e.target.value)} />
          </div>
        ))}
      </div>

      <div className="mt-4">
        <p>Plusvalía bruta: {plusvalia.toFixed(2)} €</p>
        <p>Impuesto Plusvalía Municipal: {plusvaliaMunicipal.toFixed(2)} €</p>
        <p>IRPF Ganancia Patrimonial: {impuestoRenta.toFixed(2)} €</p>
        <p>Comisión Agencia: {comision.toFixed(2)} €</p>
        <p>Notaría: {notaria.toFixed(2)} €</p>
        <p>Registro: {registro.toFixed(2)} €</p>
        <p>Gestoría: {gestoria.toFixed(2)} €</p>
        <p>Otros: {otros.toFixed(2)} €</p>
        <p>Hipoteca Pendiente: {hipotecaPendiente.toFixed(2)} €</p>
        <p className="font-bold text-xl mt-2">DINERO NETO FINAL: <span className={neto>=0?"text-green-600":"text-red-600"}>{neto.toFixed(2)} €</span></p>
      </div>
    </div>
  );
}

// Simulador de inversión para múltiples propiedades
function InversionSimulator({ capitalDisponible, setCapitalDisponible }) {
  const [propiedades, setPropiedades] = useState([]);

  // Añade una nueva propiedad con valores por defecto
  const addPropiedad = () => {
    setPropiedades(prev => [...prev, {
      id: Date.now(),
      precioCompra: 150000,
      entradaPorcentaje: 20,
      plazoHipoteca: 25,
      tipoInteres: 3.5,
      gastosCompra: 12,
      gastosReforma: 0,
      habitaciones: 3,
      alquilerPorHabitacion: 400,
      gastosMensuales: 150,
      vacacionalPorcentaje: 8,
    }]);
  };

  // Elimina una propiedad del listado
  const removePropiedad = (id) => {
    setPropiedades(prev => prev.filter(p=>p.id!==id));
  };

  // Actualiza un campo específico de una propiedad
  const handleChange = (id, campo, valor) => {
    setPropiedades(prev => prev.map(p => p.id===id?{...p,[campo]:parseFloat(valor)||0}:p));
  };

  // Obtiene métricas financieras para una propiedad
  const calcular = (p) => {
    const entrada = p.precioCompra * (p.entradaPorcentaje/100);
    const hipoteca = p.precioCompra - entrada;
    const tasaMensual = (p.tipoInteres/100)/12;
    const n = p.plazoHipoteca*12;
    const cuota = tasaMensual===0?hipoteca/n:(hipoteca*tasaMensual)/(1-Math.pow(1+tasaMensual,-n));
    const ingresoBruto = p.habitaciones * p.alquilerPorHabitacion;
    const ingresoNeto = ingresoBruto * (1 - p.vacacionalPorcentaje/100) - p.gastosMensuales;
    const cashflow = ingresoNeto - cuota;
    const inversionInicial = entrada + (p.precioCompra * (p.gastosCompra/100)) + p.gastosReforma;
    const roi = inversionInicial>0? (cashflow*12)/inversionInicial : 0;
    const rentabilidad = (ingresoNeto*12)/p.precioCompra;
    return { entrada, hipoteca, cuota, ingresoBruto, ingresoNeto, cashflow, roi, rentabilidad };
  };

  // Acumula métricas globales del conjunto de propiedades
  const resumen = propiedades.reduce((acc,p)=>{
    const r = calcular(p);
    acc.capitalUsado += r.entrada + (p.precioCompra*(p.gastosCompra/100)) + p.gastosReforma;
    acc.cashflowTotal += r.cashflow;
    acc.roiTotal += r.roi;
    acc.rentabilidadTotal += r.rentabilidad;
    return acc;
  }, {capitalUsado:0,cashflowTotal:0,roiTotal:0,rentabilidadTotal:0});

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Módulo 2: Simulador de Inversión</h2>
      <div className="mb-4">
        <label className="block">Capital Disponible (€)</label>
        <input type="number" className="border p-2 w-full" value={capitalDisponible} onChange={e=>setCapitalDisponible(parseFloat(e.target.value)||0)} />
      </div>
      <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={addPropiedad}>Añadir Propiedad</button>

      {propiedades.map(p => {
        const r = calcular(p);
        return (
          <div key={p.id} className="mt-4 border p-4 rounded">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Propiedad #{p.id}</h3>
              <button className="text-red-600" onClick={()=>removePropiedad(p.id)}>Eliminar</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block">Precio Compra (€)</label>
                <input type="number" className="border p-2 w-full" value={p.precioCompra} onChange={e=>handleChange(p.id,'precioCompra',e.target.value)} />
              </div>
              <div>
                <label className="block">Entrada (%)</label>
                <input type="number" className="border p-2 w-full" value={p.entradaPorcentaje} onChange={e=>handleChange(p.id,'entradaPorcentaje',e.target.value)} />
              </div>
              <div>
                <label className="block">Plazo Hipoteca (años)</label>
                <input type="number" className="border p-2 w-full" value={p.plazoHipoteca} onChange={e=>handleChange(p.id,'plazoHipoteca',e.target.value)} />
              </div>
              <div>
                <label className="block">Interés (%)</label>
                <input type="number" className="border p-2 w-full" value={p.tipoInteres} onChange={e=>handleChange(p.id,'tipoInteres',e.target.value)} />
              </div>
              <div>
                <label className="block">Gastos Compra (%)</label>
                <input type="number" className="border p-2 w-full" value={p.gastosCompra} onChange={e=>handleChange(p.id,'gastosCompra',e.target.value)} />
              </div>
              <div>
                <label className="block">Gastos Reforma (€)</label>
                <input type="number" className="border p-2 w-full" value={p.gastosReforma} onChange={e=>handleChange(p.id,'gastosReforma',e.target.value)} />
              </div>
              <div>
                <label className="block">Habitaciones</label>
                <input type="number" className="border p-2 w-full" value={p.habitaciones} onChange={e=>handleChange(p.id,'habitaciones',e.target.value)} />
              </div>
              <div>
                <label className="block">Alquiler por Habitación (€)</label>
                <input type="number" className="border p-2 w-full" value={p.alquilerPorHabitacion} onChange={e=>handleChange(p.id,'alquilerPorHabitacion',e.target.value)} />
              </div>
              <div>
                <label className="block">Gastos Mensuales (€)</label>
                <input type="number" className="border p-2 w-full" value={p.gastosMensuales} onChange={e=>handleChange(p.id,'gastosMensuales',e.target.value)} />
              </div>
              <div>
                <label className="block">Vacacional (%)</label>
                <input type="number" className="border p-2 w-full" value={p.vacacionalPorcentaje} onChange={e=>handleChange(p.id,'vacacionalPorcentaje',e.target.value)} />
              </div>
            </div>
            <div className="mt-2">
              <p>Cuota Hipoteca: {r.cuota.toFixed(2)} €/mes</p>
              <p>Ingresos Brutos: {r.ingresoBruto.toFixed(2)} €/mes</p>
              <p>Ingresos Netos: {r.ingresoNeto.toFixed(2)} €/mes</p>
              <p>Cash Flow: <span className={r.cashflow>=0?"text-green-600":"text-red-600"}>{r.cashflow.toFixed(2)} €/mes</span></p>
              <p>ROI anual: {(r.roi*100).toFixed(2)}%</p>
              <p>Rentabilidad neta anual: {(r.rentabilidad*100).toFixed(2)}%</p>
            </div>
          </div>
        );
      })}

      {propiedades.length>0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p>Capital utilizado: {resumen.capitalUsado.toFixed(2)} € / Disponible: {capitalDisponible.toFixed(2)} €</p>
          <p>Cash Flow mensual total: {resumen.cashflowTotal.toFixed(2)} €</p>
          <p>ROI promedio: {(propiedades.length ? (resumen.roiTotal/propiedades.length)*100 : 0).toFixed(2)}%</p>
          <p>Rentabilidad anual total: {(propiedades.length ? (resumen.rentabilidadTotal/propiedades.length)*100 : 0).toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
}

// Monta la aplicación en el DOM
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
