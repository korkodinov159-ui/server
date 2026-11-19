import React from 'react';
import { Card, Div, Text } from '@vkontakte/vkui';
import type { Character } from '../types';
import { calcPower } from '../config';

export function CharacterCard({ ch, children }: { ch: Character; children?: React.ReactNode }) {
  return (
    <Card mode="shadow" style={{ padding: 12, marginBottom: 8 }}>
      <Text weight="1">{ch.name}</Text>
      <Text>Тип: {ch.type === 'player' ? 'Игрок' : 'Бот'} | {ch.rarity}</Text>
      <Text>Ур. {ch.level} | Сила: {calcPower(ch.basePower, ch.level, ch.rarity)}</Text>
      <Div style={{ padding: 0, marginTop: 8 }}>{children}</Div>
    </Card>
  );
}