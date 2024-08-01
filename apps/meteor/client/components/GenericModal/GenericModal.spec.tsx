import { useSetModal } from '@rocket.chat/ui-contexts';
import { act, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import React, { Suspense } from 'react';

import ModalProviderWithRegion from '../../providers/ModalProvider/ModalProviderWithRegion';
import GenericModal from './GenericModal';

import '@testing-library/jest-dom';

const renderModal = (modalElement: ReactElement) => {
	const {
		result: { current: setModal },
	} = renderHook(() => useSetModal(), {
		wrapper: ({ children }) => (
			<Suspense fallback={null}>
				<ModalProviderWithRegion>{children}</ModalProviderWithRegion>
			</Suspense>
		),
	});

	act(() => {
		setModal(modalElement);
	});

	return { setModal };
};

describe('callbacks', () => {
	it('should call onClose callback when dismissed', async () => {
		const handleClose = jest.fn();

		renderModal(<GenericModal title='Modal' onClose={handleClose} />);

		expect(await screen.findByRole('heading', { name: 'Modal', exact: true })).toBeInTheDocument();

		userEvent.keyboard('{Escape}');

		expect(screen.queryByRole('heading', { name: 'Modal', exact: true })).not.toBeInTheDocument();

		expect(handleClose).toHaveBeenCalled();
	});

	it('should NOT call onClose callback when confirmed', async () => {
		const handleConfirm = jest.fn();
		const handleClose = jest.fn();

		const { setModal } = renderModal(<GenericModal title='Modal' onConfirm={handleConfirm} onClose={handleClose} />);

		expect(await screen.findByRole('heading', { name: 'Modal', exact: true })).toBeInTheDocument();

		userEvent.click(screen.getByRole('button', { name: 'Ok', exact: true }));

		expect(handleConfirm).toHaveBeenCalled();

		act(() => {
			setModal(null);
		});

		expect(screen.queryByRole('heading', { name: 'Modal', exact: true })).not.toBeInTheDocument();

		expect(handleClose).not.toHaveBeenCalled();
	});

	it('should NOT call onClose callback when cancelled', async () => {
		const handleCancel = jest.fn();
		const handleClose = jest.fn();

		const { setModal } = renderModal(<GenericModal title='Modal' onCancel={handleCancel} onClose={handleClose} />);

		expect(await screen.findByRole('heading', { name: 'Modal', exact: true })).toBeInTheDocument();

		userEvent.click(screen.getByRole('button', { name: 'Cancel', exact: true }));

		expect(handleCancel).toHaveBeenCalled();

		act(() => {
			setModal(null);
		});

		expect(screen.queryByRole('heading', { name: 'Modal', exact: true })).not.toBeInTheDocument();

		expect(handleClose).not.toHaveBeenCalled();
	});
});