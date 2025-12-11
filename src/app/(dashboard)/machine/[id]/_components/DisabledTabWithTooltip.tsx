import { Tab, Tooltip } from '@mui/material'

const DisabledTabWithTooltip = ({ value, label }: { value: string; label: string }) => (
  <Tooltip
    arrow
    key={value}
    title={
      <>
        <p>해당 탭으로 이동하려면</p>
        <p>먼저 변경사항을 폐기하거나 저장해주세요</p>
      </>
    }
  >
    <span>
      <Tab value={value} label={label} disabled />
    </span>
  </Tooltip>
)

export default DisabledTabWithTooltip
