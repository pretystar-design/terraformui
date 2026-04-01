import type { ProviderCatalog } from '@/types'

export const providerCatalog: ProviderCatalog[] = [
  {
    provider: 'aws',
    name: 'Amazon Web Services',
    version: '5.0',
    services: {
      ec2: [
        {
          type: 'aws_instance',
          name: 'Instance',
          service: 'ec2',
          provider: 'aws',
          description: 'Provides an EC2 instance resource.',
          attributes: [
            { name: 'ami', type: 'string', required: true, description: 'AMI ID', category: 'basic' },
            { name: 'instance_type', type: 'string', required: true, description: 'Instance type', defaultValue: 't2.micro', category: 'basic' },
            { name: 'key_name', type: 'string', required: false, description: 'SSH key pair name', category: 'security' },
            { name: 'subnet_id', type: 'string', required: false, description: 'VPC Subnet ID', category: 'networking' },
            { name: 'vpc_security_group_ids', type: 'list', required: false, description: 'Security group IDs', category: 'security' },
            { name: 'tags', type: 'map', required: false, description: 'Resource tags', category: 'basic' },
          ],
        },
        {
          type: 'aws_security_group',
          name: 'Security Group',
          service: 'ec2',
          provider: 'aws',
          description: 'Provides a security group resource.',
          attributes: [
            { name: 'name', type: 'string', required: true, description: 'Security group name', category: 'basic' },
            { name: 'description', type: 'string', required: false, description: 'Description', defaultValue: 'Managed by Terraform', category: 'basic' },
            { name: 'vpc_id', type: 'string', required: false, description: 'VPC ID', category: 'networking' },
          ],
        },
        {
          type: 'aws_key_pair',
          name: 'Key Pair',
          service: 'ec2',
          provider: 'aws',
          description: 'Provides an EC2 key pair resource.',
          attributes: [
            { name: 'key_name', type: 'string', required: true, description: 'Key pair name', category: 'basic' },
            { name: 'public_key', type: 'string', required: true, description: 'Public key material', category: 'security' },
          ],
        },
      ],
      s3: [
        {
          type: 'aws_s3_bucket',
          name: 'S3 Bucket',
          service: 's3',
          provider: 'aws',
          description: 'Provides an S3 bucket resource.',
          attributes: [
            { name: 'bucket', type: 'string', required: false, description: 'Bucket name', category: 'basic' },
            { name: 'tags', type: 'map', required: false, description: 'Resource tags', category: 'basic' },
          ],
        },
      ],
      vpc: [
        {
          type: 'aws_vpc',
          name: 'VPC',
          service: 'vpc',
          provider: 'aws',
          description: 'Provides a VPC resource.',
          attributes: [
            { name: 'cidr_block', type: 'string', required: true, description: 'CIDR block', category: 'networking' },
            { name: 'enable_dns_support', type: 'bool', required: false, description: 'DNS support', defaultValue: true, category: 'networking' },
          ],
        },
        {
          type: 'aws_subnet',
          name: 'Subnet',
          service: 'vpc',
          provider: 'aws',
          description: 'Provides a VPC subnet resource.',
          attributes: [
            { name: 'vpc_id', type: 'string', required: true, description: 'VPC ID', category: 'networking' },
            { name: 'cidr_block', type: 'string', required: true, description: 'CIDR block', category: 'networking' },
          ],
        },
      ],
    },
  },
  {
    provider: 'azure',
    name: 'Microsoft Azure',
    version: '3.0',
    services: {
      compute: [
        {
          type: 'azurerm_linux_virtual_machine',
          name: 'Linux VM',
          service: 'compute',
          provider: 'azure',
          description: 'Manages a Linux Virtual Machine.',
          attributes: [
            { name: 'name', type: 'string', required: true, description: 'VM name', category: 'basic' },
            { name: 'resource_group_name', type: 'string', required: true, description: 'Resource group', category: 'basic' },
            { name: 'location', type: 'string', required: true, description: 'Azure region', category: 'basic' },
            { name: 'size', type: 'string', required: true, description: 'VM size', defaultValue: 'Standard_DS1_v2', category: 'basic' },
            { name: 'admin_username', type: 'string', required: true, description: 'Admin username', category: 'security' },
          ],
        },
      ],
      network: [
        {
          type: 'azurerm_virtual_network',
          name: 'Virtual Network',
          service: 'network',
          provider: 'azure',
          description: 'Manages a Virtual Network.',
          attributes: [
            { name: 'name', type: 'string', required: true, description: 'VNet name', category: 'networking' },
            { name: 'resource_group_name', type: 'string', required: true, description: 'Resource group', category: 'basic' },
            { name: 'location', type: 'string', required: true, description: 'Azure region', category: 'basic' },
            { name: 'address_space', type: 'list', required: true, description: 'Address space', category: 'networking' },
          ],
        },
      ],
    },
  },
  {
    provider: 'gcp',
    name: 'Google Cloud Platform',
    version: '4.0',
    services: {
      compute: [
        {
          type: 'google_compute_instance',
          name: 'Compute Instance',
          service: 'compute',
          provider: 'gcp',
          description: 'Manages a Compute Engine instance.',
          attributes: [
            { name: 'name', type: 'string', required: true, description: 'Instance name', category: 'basic' },
            { name: 'machine_type', type: 'string', required: true, description: 'Machine type', defaultValue: 'e2-micro', category: 'basic' },
            { name: 'zone', type: 'string', required: false, description: 'GCP zone', category: 'basic' },
            { name: 'boot_disk', type: 'object', required: true, description: 'Boot disk config', category: 'basic' },
          ],
        },
      ],
      storage: [
        {
          type: 'google_storage_bucket',
          name: 'Storage Bucket',
          service: 'storage',
          provider: 'gcp',
          description: 'Manages a Cloud Storage bucket.',
          attributes: [
            { name: 'name', type: 'string', required: true, description: 'Bucket name', category: 'basic' },
            { name: 'location', type: 'string', required: false, description: 'Bucket location', defaultValue: 'US', category: 'basic' },
          ],
        },
      ],
    },
  },
]

export function getAllResources() {
  const resources: Array<ProviderCatalog['services'][string][number]> = []
  for (const catalog of providerCatalog) {
    for (const serviceResources of Object.values(catalog.services)) {
      resources.push(...serviceResources)
    }
  }
  return resources
}

export function searchResources(query: string) {
  const q = query.toLowerCase()
  return getAllResources().filter(
    (r) =>
      r.type.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.service.toLowerCase().includes(q) ||
      r.provider.toLowerCase().includes(q),
  )
}
