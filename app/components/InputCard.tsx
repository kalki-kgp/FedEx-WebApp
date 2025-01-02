export const InputCard = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className='bg-background rounded-md hover:shadow-lg transition-all flex flex-col items-stretch'>
			<div className='h-16 bg-black/20'></div>
			<div className='py-10 px-8'>{children}</div>
		</div>
	)
}
