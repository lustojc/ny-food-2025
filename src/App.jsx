import { useState, useEffect, useCallback, useRef } from 'react'
import { db } from './firebase'
import { ref, onValue, set, update, push, remove } from 'firebase/database'

// Единицы измерения
const UNITS = ['кг', 'г', 'шт', 'уп', 'л', 'банки', 'пачки', 'набор', 'комплект']

// Данные по умолчанию (для инициализации)
const defaultData = {
  shashlik: [
    { id: 1, name: 'Свиная шея', qty: 4, unit: 'кг', price: 15, total: 60, comment: '' },
    { id: 2, name: 'Куриные бёдра', qty: 2.5, unit: 'кг', price: 8, total: 20, comment: '' },
    { id: 3, name: 'Говядина (вырезка)', qty: 1.5, unit: 'кг', price: 22, total: 33, comment: '' },
    { id: 4, name: 'Маринад, специи, соусы', qty: 1, unit: 'набор', price: 15, total: 15, comment: 'Чеснок, лук, лимон' },
  ],
  appetizers: [
    { id: 1, name: 'Колбаса сырокопчёная', qty: 0.5, unit: 'кг', price: 25, total: 12.5, comment: '' },
    { id: 2, name: 'Колбаса полукопчёная', qty: 0.5, unit: 'кг', price: 15, total: 7.5, comment: '' },
    { id: 3, name: 'Сыр Маасдам', qty: 0.5, unit: 'кг', price: 25, total: 12.5, comment: '' },
    { id: 4, name: 'Сыр Бри', qty: 1, unit: 'уп', price: 7, total: 7, comment: 'Мягкий с плесенью' },
    { id: 5, name: 'Сёмга слабосолёная', qty: 3, unit: 'уп', price: 22, total: 66, comment: '3 упаковки по 200г' },
    { id: 6, name: 'Икра красная', qty: 1, unit: 'уп', price: 35, total: 35, comment: '200г' },
    { id: 7, name: 'Оливки + маслины', qty: 3, unit: 'банки', price: 5, total: 15, comment: '' },
    { id: 8, name: 'Огурцы маринованные', qty: 2, unit: 'банки', price: 4, total: 8, comment: '' },
    { id: 9, name: 'Грибы маринованные', qty: 2, unit: 'банки', price: 6, total: 12, comment: '' },
  ],
  breakfast: [
    { id: 1, name: 'Багет свежий', qty: 4, unit: 'шт', price: 3, total: 12, comment: 'Для бутербродов' },
    { id: 2, name: 'Сливочный сыр', qty: 1, unit: 'уп', price: 12, total: 12, comment: 'Филадельфия 500г' },
    { id: 3, name: 'Сёмга (доп)', qty: 2, unit: 'уп', price: 22, total: 44, comment: 'К завтраку' },
    { id: 4, name: 'Авокадо', qty: 4, unit: 'шт', price: 4, total: 16, comment: '' },
    { id: 5, name: 'Круассаны', qty: 9, unit: 'шт', price: 2, total: 18, comment: 'По одному на человека' },
  ],
  sides: [
    { id: 1, name: 'Картофель', qty: 4, unit: 'кг', price: 3, total: 12, comment: 'Запечь на углях' },
    { id: 2, name: 'Овощи на гриль', qty: 3, unit: 'кг', price: 8, total: 24, comment: 'Перец, кабачок, баклажан' },
    { id: 3, name: 'Шампиньоны', qty: 1, unit: 'кг', price: 8, total: 8, comment: 'На шампурах' },
    { id: 4, name: 'Лаваш', qty: 4, unit: 'шт', price: 3, total: 12, comment: '' },
    { id: 5, name: 'Зелень', qty: 1, unit: 'набор', price: 8, total: 8, comment: 'Укроп, петрушка, кинза' },
  ],
  drinks: [
    { id: 1, name: 'Cola Zero 1.5л', qty: 5, unit: 'шт', price: 3.5, total: 17.5, liters: 7.5, comment: '' },
    { id: 2, name: 'Sprite Zero 1.5л', qty: 3, unit: 'шт', price: 3.5, total: 10.5, liters: 4.5, comment: '' },
    { id: 3, name: 'Fanta 1.5л', qty: 2, unit: 'шт', price: 3.5, total: 7, liters: 3, comment: '' },
    { id: 4, name: 'Сок (микс) 1л', qty: 6, unit: 'шт', price: 4, total: 24, liters: 6, comment: 'Апельсин, яблоко' },
    { id: 5, name: 'Вода минеральная 1.5л', qty: 6, unit: 'шт', price: 2, total: 12, liters: 9, comment: '' },
    { id: 6, name: 'Морс клюквенный 1л', qty: 2, unit: 'шт', price: 5, total: 10, liters: 2, comment: '' },
  ],
  other: [
    { id: 1, name: 'Посуда одноразовая', qty: 1, unit: 'комплект', price: 25, total: 25, comment: 'Тарелки, стаканы, приборы' },
    { id: 2, name: 'Салфетки, шпажки', qty: 1, unit: 'набор', price: 10, total: 10, comment: '' },
    { id: 3, name: 'Уголь', qty: 3, unit: 'пачки', price: 8, total: 24, comment: '' },
    { id: 4, name: 'Розжиг', qty: 1, unit: 'шт', price: 5, total: 5, comment: '' },
    { id: 5, name: 'Пакеты, плёнка', qty: 1, unit: 'набор', price: 6, total: 6, comment: '' },
  ],
  peopleCount: 9
}

// Editable Row Component
function EditableRow({ item, dataKey, showLiters, onUpdate, onRemove }) {
  const [localItem, setLocalItem] = useState(item)
  const nameRef = useRef(null)

  // Sync with parent when new item comes in (external update), BUT only if we are not editing it
  // Actually with realtime sync, we should be careful not to overwrite local work if latency is high
  // But for this use case, simple sync is fine. To fix cursor jump, we kept local state.
  useEffect(() => {
    // Only update from props if IDs match (same item)
    // and deep comparison differs? Or just update.
    // For simplicity, we update local state when prop changes, 
    // but this might cause cursor jump if other person types same time. 
    // Accepted trade-off for simplicity, or we check if focused.
    if (document.activeElement !== nameRef.current) {
      setLocalItem(item)
    }
  }, [item])

  const handleChange = (field, value) => {
    const updated = { ...localItem, [field]: value }
    if (field === 'qty' || field === 'price') {
      updated.total = Number((updated.qty * updated.price).toFixed(2))
    }
    setLocalItem(updated)
  }

  const handleBlur = () => {
    onUpdate(dataKey, item.id, localItem)
  }

  // Also save on Enter or just delay? Blur is safer for database writes.

  return (
    <tr>
      <td>
        <div className="product-cell">
          <input
            ref={nameRef}
            type="text"
            className="product-name"
            value={localItem.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={handleBlur}
          />
          <input
            type="text"
            className="product-comment"
            value={localItem.comment || ''}
            placeholder="+ комментарий"
            onChange={(e) => handleChange('comment', e.target.value)}
            onBlur={handleBlur}
          />
        </div>
      </td>
      <td className="value-cell">
        <input
          type="number"
          className="value-input"
          value={localItem.qty}
          step="0.5"
          onChange={(e) => handleChange('qty', parseFloat(e.target.value) || 0)}
          onBlur={handleBlur}
        />
        <select
          className="unit-select"
          value={localItem.unit}
          onChange={(e) => {
            const newVal = e.target.value
            const updated = { ...localItem, unit: newVal }
            setLocalItem(updated)
            onUpdate(dataKey, item.id, updated)
          }}
        >
          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </td>
      {showLiters && (
        <td className="value-cell">
          <input
            type="number"
            className="value-input liters-input"
            value={localItem.liters || 0}
            step="0.5"
            onChange={(e) => handleChange('liters', parseFloat(e.target.value) || 0)}
            onBlur={handleBlur}
          />
          <span className="value-unit">л</span>
        </td>
      )}
      <td className="value-cell">
        <input
          type="number"
          className="value-input"
          value={localItem.price}
          step="0.5"
          onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
          onBlur={handleBlur}
        />
        <span className="value-unit">BYN</span>
      </td>
      <td className="value-cell">
        <span className="value-total">{localItem.total.toFixed(2)}</span>
      </td>
      <td className="action-cell">
        <button className="btn-delete" onClick={() => onRemove(dataKey, item.id)}>✕</button>
      </td>
    </tr>
  )
}

function App() {
  const [data, setData] = useState(null) // Start null to show loading
  const [connected, setConnected] = useState(false)

  // Initial Data Upload (if empty) & Subscription
  useEffect(() => {
    const dataRef = ref(db, '/')

    // Subscribe to changes
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const val = snapshot.val()
      if (val) {
        // Transform object back to array if needed needed (Firebase stores arrays as objects with numeric keys sometimes)
        // But if we initialized with arrays, it should be fine.
        // Let's ensure structure.
        const cleanData = {
          shashlik: val.shashlik || [],
          appetizers: val.appetizers || [],
          breakfast: val.breakfast || [],
          sides: val.sides || [],
          drinks: val.drinks || [],
          other: val.other || [],
          peopleCount: val.peopleCount || 9
        }
        setData(cleanData)
        setConnected(true)
      } else {
        // No data in DB, initializing...
        set(dataRef, defaultData)
      }
    }, (error) => {
      console.error("Firebase Error:", error)
      setConnected(false)
    })

    return () => unsubscribe()
  }, [])

  // Calculations
  const calcTotal = (items) => items ? items.reduce((sum, item) => sum + (item?.total || 0), 0) : 0

  const getTotals = () => {
    if (!data) return { grand: 0, perPerson: 0, meat: 0, liters: 0 }

    const cats = ['shashlik', 'appetizers', 'breakfast', 'sides', 'drinks', 'other']
    let grand = 0
    cats.forEach(c => grand += calcTotal(data[c] || []))

    const meat = (data.shashlik || []).filter(i => i.unit === 'кг').reduce((sum, i) => sum + i.qty, 0)
    const liters = (data.drinks || []).reduce((sum, d) => sum + (d.liters || 0), 0)

    return {
      grand,
      perPerson: Math.ceil(grand / (data.peopleCount || 9)),
      meat,
      liters
    }
  }

  const { grand, perPerson, meat, liters } = getTotals()

  // Actions
  const updateItem = (key, id, updatedItem) => {
    // Find index for path
    const index = data[key].findIndex(i => i.id === id)
    if (index !== -1) {
      const itemRef = ref(db, `/${key}/${index}`)
      update(itemRef, updatedItem)
    }
  }

  const addItem = (key, template) => {
    const items = data[key] || []
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1
    const newItem = { ...template, id: newId, comment: '' }

    const listRef = ref(db, `/${key}`)
    // Read current length to append? 
    // Or just write to index = length.
    // Easier to just update parent array to avoid index issues?
    // Safe approach for array:
    const updatedList = [...items, newItem]
    set(ref(db, `/${key}`), updatedList)
  }

  const removeItem = (key, id) => {
    const items = data[key] || []
    const updatedList = items.filter(i => i.id !== id)
    set(ref(db, `/${key}`), updatedList)
  }

  const updatePeople = (count) => {
    set(ref(db, '/peopleCount'), count)
  }

  // Snowflakes (CLIENT SIDE ONLY)
  const snowflakes = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 15,
    duration: 15 + Math.random() * 10,
    size: 10 + Math.random() * 12,
  }))

  // Table component
  const Table = ({ items, dataKey, showLiters = false }) => (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Продукт</th>
            <th className="align-right">Кол-во</th>
            {showLiters && <th className="align-right">Литры</th>}
            <th className="align-right">Цена</th>
            <th className="align-right">Сумма</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(items || []).map(item => (
            <EditableRow
              key={item.id}
              item={item}
              dataKey={dataKey}
              showLiters={showLiters}
              onUpdate={updateItem}
              onRemove={removeItem}
            />
          ))}
        </tbody>
      </table>
    </div>
  )

  if (!data) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Подключение к Firebase...</span>
      </div>
    )
  }

  return (
    <>
      <div className="snowflakes">
        {snowflakes.map(f => (
          <div key={f.id} className="snowflake" style={{
            left: `${f.left}%`,
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.duration}s`,
            fontSize: `${f.size}px`,
          }}>❄</div>
        ))}
      </div>

      <header className="header">
        <div className="container header-content">
          <h1>🎄 Новогодний стол 2025</h1>
          <div className="header-meta">
            <span>📅 31 дек — 1 янв</span>
            <span>🔥 Firebase Realtime</span>
            <span>
              👥
              <input
                type="number"
                className="people-input"
                value={data.peopleCount}
                min="1"
                onChange={(e) => updatePeople(parseInt(e.target.value) || 1)}
              />
              чел
            </span>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-value">{grand.toFixed(0)}</div>
            <div className="summary-label">BYN всего</div>
          </div>
          <div className="summary-card highlight">
            <div className="summary-value">{perPerson}</div>
            <div className="summary-label">BYN / чел</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">{meat}</div>
            <div className="summary-label">кг мяса</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">{liters}</div>
            <div className="summary-label">л напитков</div>
          </div>
        </div>

        {!connected && (
          <div className="sync-status error">
            <div className="sync-dot error"></div>
            <span>Ошибка подключения или неверный конфиг</span>
          </div>
        )}

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">🥩 Шашлык</h2>
            <span className="section-badge">{calcTotal(data.shashlik).toFixed(0)} BYN</span>
          </div>
          <Table items={data.shashlik} dataKey="shashlik" />
          <button className="btn-add" onClick={() => addItem('shashlik', { name: '', qty: 1, unit: 'кг', price: 0, total: 0 })}>
            + Добавить
          </button>
        </section>

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">🧀 Нарезки</h2>
            <span className="section-badge">{calcTotal(data.appetizers).toFixed(0)} BYN</span>
          </div>
          <Table items={data.appetizers} dataKey="appetizers" />
          <button className="btn-add" onClick={() => addItem('appetizers', { name: '', qty: 1, unit: 'шт', price: 0, total: 0 })}>
            + Добавить
          </button>
        </section>

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">🍞 Завтрак</h2>
            <span className="section-badge">{calcTotal(data.breakfast).toFixed(0)} BYN</span>
          </div>
          <Table items={data.breakfast} dataKey="breakfast" />
          <button className="btn-add" onClick={() => addItem('breakfast', { name: '', qty: 1, unit: 'шт', price: 0, total: 0 })}>
            + Добавить
          </button>
        </section>

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">🍖 Горячее</h2>
            <span className="section-badge">{calcTotal(data.sides).toFixed(0)} BYN</span>
          </div>
          <Table items={data.sides} dataKey="sides" />
          <button className="btn-add" onClick={() => addItem('sides', { name: '', qty: 1, unit: 'кг', price: 0, total: 0 })}>
            + Добавить
          </button>
        </section>

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">🥤 Напитки</h2>
            <span className="section-badge">{calcTotal(data.drinks).toFixed(0)} BYN</span>
          </div>
          <Table items={data.drinks} dataKey="drinks" showLiters />
          <button className="btn-add" onClick={() => addItem('drinks', { name: '', qty: 1, unit: 'шт', price: 0, total: 0, liters: 0 })}>
            + Добавить
          </button>
        </section>

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">📦 Прочее</h2>
            <span className="section-badge">{calcTotal(data.other).toFixed(0)} BYN</span>
          </div>
          <Table items={data.other} dataKey="other" />
          <button className="btn-add" onClick={() => addItem('other', { name: '', qty: 1, unit: 'шт', price: 0, total: 0 })}>
            + Добавить
          </button>
        </section>
      </main>

      <footer className="footer">
        <p className="footer-main">С Новым 2025 Годом! 🎄</p>
        <p>Синхронизация через Firebase Realtime Database 🟢</p>
      </footer>
    </>
  )
}

export default App
