'use client';
import { useFormContext } from 'react-hook-form';
import type { NuevaValoracionForm } from '@/app/(dashboard)/valoracion/nueva/page';

const DISPOSITIVOS_CONFIG = [
  { key: 'cvc', label: 'Catéter venoso central (CVC)', icono: '🔵', tipoLabel: 'Tipo / Sitio' },
  { key: 'cateter_urinario', label: 'Catéter urinario', icono: '🟡', tipoLabel: 'Tipo' },
  { key: 'sonda_enteral', label: 'Sonda enteral (SNG/PEG)', icono: '🟠', tipoLabel: 'Tipo' },
  { key: 'drenajes', label: 'Drenajes quirúrgicos', icono: '🟤', tipoLabel: 'Tipo / Características' },
  { key: 'via_periferica', label: 'Acceso venoso periférico', icono: '⚪', tipoLabel: 'Sitio' },
];

export default function Step7Dispositivos() {
  const { watch, setValue } = useFormContext<NuevaValoracionForm>();
  const disp = (watch('dispositivos') as Record<string, any>) ?? {};

  const updateDisp = (key: string, field: string, value: any) => {
    setValue('dispositivos', {
      ...disp,
      [key]: { ...(disp[key] ?? {}), [field]: value },
    });
  };

  return (
    <div className="form-section">
      <h3 className="form-section-title">Paso 7 — Dispositivos invasivos y soporte</h3>
      <p className="text-xs text-gray-400 mb-5 -mt-2">
        Los dispositivos invasivos son factores de riesgo importantes. Registrar los días de uso para generar alertas de prevención de IAAS.
      </p>

      <div className="space-y-3">
        {DISPOSITIVOS_CONFIG.map(d => (
          <div key={d.key} className={`border rounded-xl p-4 transition-all ${
            disp[d.key]?.presente ? 'border-clinical-200 bg-clinical-50/30' : 'border-gray-100 bg-white'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id={d.key}
                className="w-4 h-4 text-clinical-500 rounded border-gray-300"
                checked={!!disp[d.key]?.presente}
                onChange={e => updateDisp(d.key, 'presente', e.target.checked)}
              />
              <label htmlFor={d.key} className="text-sm font-semibold text-slate-700 cursor-pointer flex items-center gap-2">
                <span>{d.icono}</span> {d.label}
              </label>
            </div>

            {disp[d.key]?.presente && (
              <div className="grid grid-cols-2 gap-3 mt-1 pl-7">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Días de uso</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    className="input-clinical text-sm"
                    value={disp[d.key]?.dias ?? ''}
                    onChange={e => updateDisp(d.key, 'dias', parseInt(e.target.value))}
                  />
                  {disp[d.key]?.dias >= 7 && (
                    <p className="text-xs text-warning-600 mt-1 font-medium">⚠ Día {disp[d.key].dias} — Reevaluar necesidad</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">{d.tipoLabel}</label>
                  <input
                    type="text"
                    className="input-clinical text-sm"
                    placeholder="Ej: Triple lumen, yugular derecha"
                    value={disp[d.key]?.tipo ?? ''}
                    onChange={e => updateDisp(d.key, 'tipo', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Soporte farmacológico */}
        <div className="border border-gray-100 rounded-xl p-4 bg-white">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Soporte farmacológico especial</h4>
          <div className="space-y-3">
            {[
              { key: 'sedacion', label: 'Sedoanalgesia infusión continua', tipoLabel: 'Fármacos y objetivo RASS' },
              { key: 'vasopresores', label: 'Vasopresores / inotrópicos', tipoLabel: 'Fármaco, dosis y objetivo PAM' },
            ].map(sf => (
              <div key={sf.key} className={`rounded-lg p-3 transition-all border ${
                disp[sf.key]?.presente ? 'border-warning-200 bg-warning-50/30' : 'border-gray-100'
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={sf.key}
                    className="w-4 h-4 text-clinical-500 rounded border-gray-300"
                    checked={!!disp[sf.key]?.presente}
                    onChange={e => updateDisp(sf.key, 'presente', e.target.checked)}
                  />
                  <label htmlFor={sf.key} className="text-sm font-medium text-slate-700 cursor-pointer">{sf.label}</label>
                </div>
                {disp[sf.key]?.presente && (
                  <div className="mt-2 pl-7">
                    <input
                      type="text"
                      className="input-clinical text-sm"
                      placeholder={sf.tipoLabel}
                      value={disp[sf.key]?.farmaco ?? ''}
                      onChange={e => updateDisp(sf.key, 'farmaco', e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Aislamiento */}
        <div className={`border rounded-xl p-4 transition-all ${
          disp.aislamiento?.presente ? 'border-purple-200 bg-purple-50/30' : 'border-gray-100 bg-white'
        }`}>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="aislamiento"
              className="w-4 h-4 text-clinical-500 rounded border-gray-300"
              checked={!!disp.aislamiento?.presente}
              onChange={e => updateDisp('aislamiento', 'presente', e.target.checked)}
            />
            <label htmlFor="aislamiento" className="text-sm font-semibold text-slate-700 cursor-pointer">🔒 Medidas de aislamiento</label>
          </div>
          {disp.aislamiento?.presente && (
            <div className="mt-2 pl-7">
              <select
                className="input-clinical text-sm"
                value={disp.aislamiento?.tipo ?? ''}
                onChange={e => updateDisp('aislamiento', 'tipo', e.target.value)}
              >
                <option value="">Seleccionar tipo...</option>
                <option value="Estándar">Precauciones estándar</option>
                <option value="Gotas y contacto">Gotas y contacto</option>
                <option value="Aéreo">Aéreo (TBC, sarampión, varicela)</option>
                <option value="Contacto">Solo contacto</option>
                <option value="MRSA/MDR">MRSA / Multidrresistente</option>
                <option value="Inmunocompromiso">Protector (inmunocomprometido)</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
