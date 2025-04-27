import MovableModal from "../UI/movableModal/MovableModal";
import { useState } from "react";
import { Button, Typography } from "@mui/material";

const RulesModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <div>
      <Button variant="contained" onClick={openModal}>
        Правила
      </Button>

      <MovableModal isOpen={isOpen} onClose={closeModal} id="rules-modal">
        <div style={{ color: "#374151", padding: "16px", maxWidth: "600px" }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Правила игры
          </Typography>

          <Typography variant="h6" gutterBottom fontWeight="bold">
            Цены на строительство:
          </Typography>
          <Typography component="div" gutterBottom>
            - дорога: 1 глина + 1 лес<br />
            - деревня: 1 глина + 1 лес + 1 овца + 1 пшеница<br />
            - город: 3 камня + 2 пшеницы
          </Typography>

          <Typography paragraph>
            Дороги можно строить на гранях гексов, деревни — на перекрёстках дорог, города — на месте деревень.
          </Typography>

          <Typography paragraph>
            В дебюте игрок должен построить деревню и дорогу.
          </Typography>

          <Typography paragraph>
            В свой ход игрок бросает кубик (за исключением дебюта). Игрок, имеющий деревню, примыкающую к гексу с выпавшим номером, получает 1 ресурс, соответствующий этому гексу. Владелец города получает 2 ресурса.
          </Typography>

          <Typography paragraph>
            После броска кубиков игрок может обмениваться ресурсами с другими игроками или банком. Если у игрока есть деревня или город рядом с гаванью, он может торговать через гавань по более выгодному курсу. Также игрок может строить дороги, деревни, города или покупать карты развития.
          </Typography>

          <Typography paragraph>
            Карту развития (за исключением карты победных очков) нельзя активировать в ход её покупки.
          </Typography>

          <Typography paragraph>
            Цепочка из 5 дорог даёт игроку достижение <b>«Самый длинный тракт»</b> и 2 победных очка. Если другой игрок построит более длинную цепочку, достижение переходит к нему.
          </Typography>

          <Typography paragraph>
            Побеждает тот игрок, который первым наберёт установленное количество победных очков (по умолчанию — 10).
          </Typography>

          <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ marginTop: 4 }}>
            Разбойник и рыцари:
          </Typography>

          <Typography paragraph>
            Если эта механика включена, то при выпадении числа 7 игроки, имеющие на руках более 7 карт, сбрасывают половину карт (в игре это происходит автоматически, карты выбираются случайным образом). Затем игрок, у которого выпало 7, передвигает разбойника.
          </Typography>

          <Typography paragraph>
            До броска кубиков игрок может разыграть карту «Рыцарь», чтобы передвинуть разбойника. Игрок, сыгравший больше всего карт «Рыцарь» (но не менее 3), получает достижение <b>«Самая большая армия»</b>, которое даёт 2 победных очка.
          </Typography>

          <Typography paragraph>
            После передвижения разбойника игрок забирает одну случайную карту у любого игрока, имеющего деревню или город, примыкающий к гексу с разбойником.
          </Typography>
        </div>
      </MovableModal>
    </div>
  );
};

export default RulesModal;
