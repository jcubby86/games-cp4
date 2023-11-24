/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import { Button, Container, Form, Modal, Table } from 'react-bootstrap';

import Icon from './Icon';
import axios from '../utils/axiosWrapper';
import { SuggestionDto, SuggestionReqBody } from '../utils/types';

interface State {
  adding?: boolean;
  editing?: SuggestionDto;
  suggestions: SuggestionDto[];
}

const Suggestion = (): JSX.Element => {
  const [state, setState] = useState<State>({ suggestions: [] });
  const [showModal, setShowModal] = useState(false);
  const [validated, setValidated] = useState(false);
  const valueRef = useRef<HTMLTextAreaElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get<SuggestionDto[]>('/api/suggestion');

      setState({ suggestions: response.data });
    } catch (err: unknown) {
      setState({ suggestions: [] });
    }
  };

  const addSuggestion = () => {
    setState((prev) => ({ ...prev, adding: !prev.adding, editing: undefined }));
    setShowModal(true);
    setValidated(false);
  };

  const edit = (suggestion: SuggestionDto) => {
    setState((prev) => ({ ...prev, editing: suggestion, adding: false }));
    setShowModal(true);
    setValidated(false);
  };

  const cancelEdit = () => {
    setState((prev) => ({ ...prev, editing: undefined, adding: false }));
    setShowModal(false);
  };

  const save = async () => {
    try {
      if (!valueRef.current?.value || !categoryRef.current?.value) {
        setValidated(true);
        return;
      }
      if (state.editing) {
        const response = await axios.patch<SuggestionReqBody, SuggestionDto>(
          '/api/suggestion/' + state.editing.uuid,
          {
            value: valueRef.current.value,
            category: categoryRef.current.value
          }
        );
        setState((prev) => {
          const suggestions = prev.suggestions;
          const edited = suggestions.find((s) => s.uuid === response.data.uuid);
          if (edited) {
            edited.value = response.data.value;
            edited.category = response.data.category;
          }
          return {
            suggestions: [...suggestions],
            adding: false,
            editing: undefined
          };
        });
      } else {
        const response = await axios.post<SuggestionReqBody, SuggestionDto>(
          '/api/suggestion',
          {
            value: valueRef.current.value,
            category: categoryRef.current.value
          }
        );
        setState((prev) => {
          return {
            suggestions: [...prev.suggestions, response.data],
            adding: false,
            editing: undefined
          };
        });
      }
      setShowModal(false);
    } catch (err) {
      return;
    }
  };

  const deleteSuggestion = async () => {
    try {
      if (!state.editing) return;
      await axios.delete('/api/suggestion/' + state.editing.uuid);

      setState((prev) => {
        const suggestions = prev.suggestions;
        const index = suggestions.findIndex(
          (s) => s.uuid === state.editing?.uuid
        );
        if (index > -1) {
          suggestions.splice(index, 1);
        }
        return {
          suggestions: [...suggestions],
          adding: false,
          editing: undefined
        };
      });
      setShowModal(false);
    } catch (err) {
      return;
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
      <tr onClick={(_e) => edit(suggestion)}>
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
                  onClick={(_e) => addSuggestion()}
                >
                  <Icon icon="nf-oct-plus" />
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {state.suggestions
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

      <Modal show={showModal} onHide={() => cancelEdit()} className="mt-5">
        <Modal.Header closeButton>
          <Modal.Title>
            {state.adding ? 'Add Suggestion' : 'Edit Suggestion'}
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
                defaultValue={state.editing?.value}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="editForm.Category">
              <Form.Label>Category</Form.Label>
              <Form.Select
                aria-label="select category"
                ref={categoryRef}
                defaultValue={state.editing?.category}
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
          {state.editing && (
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
