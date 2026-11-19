import { Panel, PanelHeader, Group, Button } from '@vkontakte/vkui';
import { useGame } from '../store/gameStore';
import { CharacterCard } from '../components/CharacterCard';
import { upgradeCost } from '../config';

export function Upgrade({ go }: { go: (p: string) => void }) {
  const { player, upgradeCharacter } = useGame();
  return (
    <Panel id="upgrade">
      <PanelHeader before={<Button mode="tertiary" onClick={() => go('home')}>←</Button>}>Прокачка</PanelHeader>
      <Group>
        {player.characters.map((ch) => (
          <CharacterCard key={ch.id} ch={ch}>
            <Button size="m" onClick={() => upgradeCharacter(ch.id)}>
              Прокачать за {upgradeCost(ch.level, ch.rarity)} 💰
            </Button>
          </CharacterCard>
        ))}
      </Group>
    </Panel>
  );
}