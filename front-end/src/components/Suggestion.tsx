/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useReducer, useRef, useState } from 'react';
import { Button, Container, Form, Modal, Table } from 'react-bootstrap';

import Icon from './Icon';
import axios from '../utils/axiosWrapper';
import handleError from '../utils/errorHandler';
import { SuggestionDto, SuggestionReqBody } from '../utils/types';

type Action =
  | { type: 'init'; suggestions: SuggestionDto[] }
  | { type: 'add' | 'update'; suggestion: SuggestionDto }
  | { type: 'delete'; uuid: string };

const suggestionReducer = (
  prev: SuggestionDto[],
  action: Action
): SuggestionDto[] => {
  switch (action.type) {
    case 'init':
      return action.suggestions;
    case 'add':
      return [...prev, action.suggestion];
    case 'update':
      return prev.map((old) => {
        if (old.uuid === action.suggestion.uuid) {
          return action.suggestion;
        } else {
          return old;
        }
      });
    case 'delete':
      return prev.filter((s) => s.uuid !== action.uuid);
  }
};

const Suggestion = (): JSX.Element => {
  const [suggestions, dispatch] = useReducer(suggestionReducer, []);
  const [editing, setEditing] = useState<SuggestionDto | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const valueRef = useRef<HTMLTextAreaElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get<SuggestionDto[]>('/api/suggestion');
      dispatch({ type: 'init', suggestions: response.data });
    } catch (err: unknown) {
      console.error(err);
      dispatch({ type: 'init', suggestions: [] });
    }
  };

  const openModal = (suggestion?: SuggestionDto) => {
    setShowModal(true);
    setValidated(false);
    setEditing(suggestion);
  };

  const closeModal = () => {
    setEditing(undefined);
    setShowModal(false);
  };

  const save = async () => {
    try {
      if (!valueRef.current?.value || !categoryRef.current?.value) {
        setValidated(true);
        return;
      }
      if (!editing) {
        const response = await axios.post<SuggestionReqBody, SuggestionDto>(
          '/api/suggestion',
          {
            value: valueRef.current.value,
            category: categoryRef.current.value
          }
        );
        dispatch({ type: 'add', suggestion: response.data });
      } else {
        const response = await axios.patch<SuggestionReqBody, SuggestionDto>(
          '/api/suggestion/' + editing.uuid,
          {
            value: valueRef.current.value,
            category: categoryRef.current.value
          }
        );
        dispatch({ type: 'update', suggestion: response.data });
      }
      closeModal();
    } catch (err) {
      handleError('Error saving suggestion', err);
    }
  };

  const deleteSuggestion = async () => {
    try {
      if (!editing) return;
      await axios.delete('/api/suggestion/' + editing.uuid);
      dispatch({ type: 'delete', uuid: editing.uuid });
      closeModal();
    } catch (err) {
      handleError('Error deleting suggestion', err);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const SuggestionRow = ({
    suggestion
  }: {
    suggestion: SuggestionDto;
  }): JSX.Element => {
    return (
      <tr onClick={(_e) => openModal(suggestion)}>
        <td className="text-wrap">{suggestion.value}</td>
        <td className="text-nowrap text-capitalize">
          {suggestion.category.replace(/[_-]/g, ' ').toLowerCase()}
        </td>
        <td>
          <Button size="sm" variant="outline-secondary">
            <Icon icon="nf-oct-pencil"></Icon>
          </Button>
        </td>
      </tr>
    );
  };

  return (
    <>
      <Container fluid>
        <h3>Suggestions</h3>
        <Table variant="light" size="sm" hover>
          <thead>
            <tr>
              <th scope="col">Value</th>
              <th scope="col">Category</th>
              <th scope="col">
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={(_e) => openModal()}
                >
                  <Icon icon="nf-oct-plus" />
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {suggestions
              .sort(
                (a, b) =>
                  a.category.localeCompare(b.category) * 1000 +
                  a.value.localeCompare(b.value)
              )
              .map((item: SuggestionDto, index: number) => (
                <SuggestionRow key={index} suggestion={item} />
              ))}
          </tbody>
        </Table>
      </Container>

      <Modal show={showModal} onHide={() => closeModal()} className="mt-5">
        <Modal.Header closeButton>
          <Modal.Title>
            {!editing ? 'Add Suggestion' : 'Edit Suggestion'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated}>
            <Form.Group className="mb-3" controlId="editForm.Value">
              <Form.Label>Value</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                ref={valueRef}
                defaultValue={editing?.value}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="editForm.Category">
              <Form.Label>Category</Form.Label>
              <Form.Select
                aria-label="select category"
                ref={categoryRef}
                defaultValue={editing?.category}
                required
              >
                <option value="">...</option>
                <option value="MALE_NAME">Male Name</option>
                <option value="FEMALE_NAME">Female Name</option>
                <option value="STATEMENT">Statement</option>
                <option value="PAST_ACTION">Past Action</option>
                <option value="PRESENT_ACTION">Present Action</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {editing && (
            <Button
              variant="outline-danger"
              onClick={(_e) => deleteSuggestion()}
            >
              Delete
            </Button>
          )}
          <Button variant="outline-success" onClick={(_e) => save()}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Suggestion;
