import { useState, useEffect, useRef } from 'react';
import { Avatar } from '@vkontakte/vkui';
import { Character } from '../types';

interface Props {
  prize: Character | null;
  onClose: () => void;
}

export function ChestModal({ prize, onClose }: Props) {
  const [spinning, setSpinning] = useState(true);
  const [fakeItems, setFakeItems] = useState<Character[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Очищаем старые таймеры, если компонент перемонтируется
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (!prize || !trackRef.current) return;

    // Генерируем карточки
    const items = Array.from({ length: 50 }, () => ({
      id: Math.random().toString(),
      name: '???',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Math.random(),
      income: 0,
    })) as Character[];

    const winIndex = 45;
    items[winIndex] = prize;
    setFakeItems(items);
    setSpinning(true);

    const track = trackRef.current;

    // 1. Мгновенно ставим в начало без анимации
    track.style.transition = 'none';
    track.style.transform = 'translateX(0px)';

    // 2. Ждем 100мс и запускаем анимацию
    const startTimer = setTimeout(() => {
      if (!trackRef.current) return;
      
      // Включаем анимацию
      track.style.transition = 'transform 6s cubic-bezier(0.1, 0.8, 0.1, 1)';
      
      const itemWidth = 110;
      const centerOffset = 125;
      const targetOffset = -(winIndex * itemWidth) + centerOffset;
      
      track.style.transform = `translateX(${targetOffset}px)`;

      // Через 6 секунд показываем результат
      const endTimer = setTimeout(() => {
        setSpinning(false);
      }, 6000);

      timersRef.current.push(endTimer);
    }, 100);

    timersRef.current.push(startTimer);

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [prize]);

  if (!prize) return null;

  return (
    <div className="chest-modal-overlay">
      <h2 style={{ color: '#fff', marginBottom: 20, textAlign: 'center' }}>
        {spinning ? 'Открываем сундук...' : 'Твой приз!'}
      </h2>

      {spinning ? (
        <div className="roulette-container">
          <div className="roulette-pointer" />
          <div 
            className="roulette-track" 
            ref={trackRef}
          >
            {fakeItems.map((item, i) => (
              <div key={i} className="roulette-item">
                <Avatar size={48} src={item.avatar} style={{ border: '2px solid #333' }} />
                <div style={{ fontSize: 10, color: '#888', marginTop: 6, textAlign: 'center', width: '100%', padding: '0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.id === prize.id ? prize.name : '???'}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="prize-card">
          <Avatar size={80} src={prize.avatar} style={{ margin: '0 auto 16px auto', border: '3px solid #4ade80' }} />
          <div className="text-value" style={{ fontSize: 20 }}>{prize.name}</div>
          <div style={{ color: '#4ade80', fontSize: 18, fontWeight: 700, marginTop: 8 }}>
            +{prize.income} 💰 / ч
          </div>
          <button 
            className="btn-primary" 
            style={{ marginTop: 24 }} 
            onClick={onClose}
          >
            Забрать
          </button>
        </div>
      )}
    </div>
  );
}