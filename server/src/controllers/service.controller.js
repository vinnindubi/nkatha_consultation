import prisma from '../utils/prisma.js';

// Get all active services for the public booking page
export const getAllServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { price: 'asc' }
    });
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services.' });
  }
};

// Create a new service (Admin only)
export const createService = async (req, res) => {
  try {
    const { name, description, durationMinutes, price } = req.body;

    if (!name || !durationMinutes || !price) {
      return res.status(400).json({ error: 'Name, duration, and price are required.' });
    }

    const newService = await prisma.service.create({
      data: {
        name,
        description: description || '',
        durationMinutes: Number(durationMinutes),
        price: parseFloat(price)
      }
    });

    res.status(201).json(newService);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service.' });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, durationMinutes, price, focusAreas, isActive } = req.body;

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id: Number(id) }
    });

    if (!existingService) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    const updatedService = await prisma.service.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(durationMinutes && { durationMinutes: Number(durationMinutes) }),
        ...(price && { price: Number(price) }),
        ...(focusAreas !== undefined && {
          focusAreas: Array.isArray(focusAreas) 
            ? focusAreas 
            : focusAreas.split(',').map(s => s.trim()).filter(Boolean)
        }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Failed to update service.' });
  }
};

// Delete a service (Admin only)
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.service.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Service deleted successfully.' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Failed to delete service.' });
  }
};